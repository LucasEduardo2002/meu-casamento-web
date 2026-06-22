/**
 * Utility to generate an EMV / BR Code static PIX string.
 */

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    const x = ((crc >> 8) ^ str.charCodeAt(i)) & 0xFF;
    const x2 = x ^ (x >> 4);
    crc = ((crc << 8) ^ (x2 << 12) ^ (x2 << 5) ^ (x2 << 0)) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTLV(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

export interface PixConfig {
  key: string; // E.g. '84988014439'
  name: string; // Beneficiary name
  city: string; // Beneficiary city
  amount?: number | string; // Optional amount (can be string from DB)
  description?: string; // Optional description (TXID)
}

export function generatePixCode({ key, name, city, amount, description }: PixConfig): string {
  // Format phone number key if necessary (add +55 if it's purely digits and length 11)
  let formattedKey = key.replace(/\D/g, '');
  if (formattedKey.length === 11) {
    formattedKey = `+55${formattedKey}`;
  } else {
    // If it's already got + or other key type, use raw
    formattedKey = key.trim();
  }

  // Tag 00: Payload Format Indicator (Fixed to "01")
  const part00 = formatTLV('00', '01');

  // Tag 26: Merchant Account Information
  const gui = formatTLV('00', 'br.gov.bcb.pix');
  const keyTag = formatTLV('01', formattedKey);
  const part26 = formatTLV('26', `${gui}${keyTag}`);

  // Tag 52: Merchant Category Code (Fixed to "0000")
  const part52 = formatTLV('52', '0000');

  // Tag 53: Transaction Currency (Fixed to "986" for BRL)
  const part53 = formatTLV('53', '986');

  // Tag 54: Transaction Amount (Optional but formatted to 2 decimals)
  let part54 = '';
  if (amount) {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      part54 = formatTLV('54', numAmount.toFixed(2));
    }
  }

  // Tag 58: Country Code (Fixed to "BR")
  const part58 = formatTLV('58', 'BR');

  // Tag 59: Merchant Name (Up to 25 chars, removing special chars/accents)
  const cleanName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9\s]/g, '') // Keep alphanumeric and spaces
    .substring(0, 25)
    .toUpperCase();
  const part59 = formatTLV('59', cleanName);

  // Tag 60: Merchant City (Up to 15 chars, removing special chars/accents)
  const cleanCity = city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .substring(0, 15)
    .toUpperCase();
  const part60 = formatTLV('60', cleanCity);

  // Tag 62: Additional Data Field Template
  const txidValue = (description || 'CASAMENTO')
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9]/g, '') // No spaces, only alphanumeric
    .substring(0, 25)
    .toUpperCase();
  const txid = formatTLV('05', txidValue);
  const part62 = formatTLV('62', txid);

  // Concatenate all parts up to Tag 63 (without CRC value)
  const codeWithoutCrc = `${part00}${part26}${part52}${part53}${part54}${part58}${part59}${part60}${part62}6304`;

  // Calculate CRC16 and append
  const crc = crc16(codeWithoutCrc);
  return `${codeWithoutCrc}${crc}`;
}
