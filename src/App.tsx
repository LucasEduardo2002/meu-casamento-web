import React, { useState, useEffect } from 'react';
import {
  Heart,
  MapPin,
  Calendar,
  Clock,
  Copy,
  Check,
  Navigation,
  Wine,
  Lock,
  LogOut,
  Trash2,
  Users,
  RefreshCw,
  Gift,
  Menu,
  X,
  Search,
  UserCheck,
  UserX,
  RotateCcw
} from 'lucide-react';
import './App.css';
import { generatePixCode } from './utils/pix';

// Interfaces for API structures
interface GiftItem {
  id: number;
  name: string;
  description: string;
  price: number | string;
  image_url: string;
  status: 'available' | 'claimed' | 'confirmed';
  buyer_name?: string;
  buyer_phone?: string;
  payment_method?: 'pix' | 'external_purchase';
  available_quantity?: number;
}

export interface GuestItem {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  confirmed_presence: boolean;
  has_absentees?: boolean;
  absent_names?: string | null;
  phone?: string | null;
  message?: string | null;
  confirmed_at?: string | null;
}

export const DEFAULT_GUESTS_LIST = [
  'João e Cláudia',
  'Carol e Jefferson',
  'Tia Cássia e família',
  'Tia Kely',
  'Tia Claudiane',
  'Tetinha e Diá',
  'Simony e Sanderilson',
  'Nilda e Josielton',
  'Glória e João',
  'Kennedy',
  'Eduarda e Djair',
  'Franciely e Judson',
  'Matheus Felinto',
  'Layana e Fabiano',
  'Diolange Maria e Wanderley',
  'Maria Beatriz',
  'Jéssica e Fabrício',
  'Tio Augusto e família',
  'Tio Antônio e Rosa',
  'Tio Zeza e Tia Anita',
  'Júlio e Meiry Laine',
  'Tia Fátima',
  'Déborah e família',
  'Tia Nadja e família',
  'Sidney e Adalgiza',
  'Bruna e família',
  'Cota e Esposo',
  'Tia Francisquinha e Tio Abraão',
  'Surama e Evânio',
  'Anna Júlia e Eliabe',
  'Anny e Cláudio',
  'Juciene',
  'Gisele e Renan',
  'Eduarda e Jadyel',
  'Do Carmo e Geraldo',
  'Margarida Brilhante',
  'Catarina',
  'Manoel e Iraci',
  'Ceíres e Venâncio',
  'Ubaldo e família',
  'Luizinha e família',
  'Vovó Nazaré e família',
  'Cacildo e família',
  'Leonardo e família',
  'Madrinha Iaponira',
  'Vitória, Eloyse e Emily',
  'Marcosuel e família',
  'Leonardo e Lorena',
  'André e Larissa',
  'Gustavo e Letícia',
  'Ícaro e Júlia',
  'João Emanuel',
  'Carlos e Yasmin',
  'Ryckelmy e família',
  'Guilherme e Fabiana',
  'Luan e Camila',
  'Moisés',
  'Pedro e Gabriela',
  'Bruno e Sheila',
  'Tia Nilda',
  'Antônio Girorme',
  'Jaiane e José Carlos',
  'Tia Luciana',
  'Tia Graça',
  'Tio Valderi e Lourdes',
  'Tia Socorro e Danielle',
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  // Navigation & Scroll states
  const [activeSection, setActiveSection] = useState('inicio');

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // RSVP Form States (Lista pré-cadastrada e busca)
  const [guestsList, setGuestsList] = useState<GuestItem[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestItem | null>(null);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [hasAbsentees, setHasAbsentees] = useState<boolean | null>(null);
  const [absentNames, setAbsentNames] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [lastConfirmedGuestName, setLastConfirmedGuestName] = useState('');

  // Gifts List States
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [modalTab, setModalTab] = useState<'pix' | 'external'>('pix');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Claim Form States
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Pix Amount State
  const [customAmount, setCustomAmount] = useState<string>('1');

  // Admin Dashboard States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('isAdminLoggedIn') === 'true');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminRsvps, setAdminRsvps] = useState<GuestItem[]>([]);
  const [adminTab, setAdminTab] = useState<'rsvps' | 'gifts'>('rsvps');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRsvpFilter, setAdminRsvpFilter] = useState<'all' | 'confirmed' | 'pending' | 'absentees'>('all');
  const [adminGiftFilter, setAdminGiftFilter] = useState<'all' | 'claimed' | 'confirmed' | 'available'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Constants
  const PIX_KEY = '84988014439';
  const PIX_NAME = 'Lucas Eduardo Silva de Medeiros';
  const PIX_CITY = 'Currais Novos';
  const DELIVERY_ADDRESS = 'Rua Mariano Guimarães, 97, Parque Dourado, Currais Novos/RN';

  // Calculate Countdown
  useEffect(() => {
    const targetDate = new Date('2027-01-16T16:30:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Gifts from Backend
  const fetchGifts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gifts`);
      if (response.ok) {
        const data: GiftItem[] = await response.json();
        const filtered = data.filter(g => {
          const norm = (g.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          const isGarrafa = norm.includes('garrafa') && norm.includes('termica');
          const isSilicone = norm.includes('silicone');
          const isTabuaCarne = norm.includes('tabua') && (norm.includes('carne') || norm.includes('corte') || norm.includes('bambu'));
          return !isGarrafa && !isSilicone && !isTabuaCarne;
        });
        setGifts(filtered);
      } else {
        throw new Error('Erro ao buscar presentes da API.');
      }
    } catch (error) {
      console.warn('Backend indisponível. Usando presentes locais como fallback.', error);
      // Fallback data in case the backend is not running
      setGifts([
        {
          id: 1.00,
          name: 'Jogo de Panelas de Cerâmica',
          description: 'Jogo de panelas com revestimento cerâmico.',
          price: 504.00,
          image_url: '/Lista-presentes/panelas-ceramica.jpg',
          status: 'available',
        },
        {
          id: 2.00,
          name: 'Aparelho de Jantar Completo',
          description: 'Conjunto de pratos para refeições.',
          price: 367.50,
          image_url: '/Lista-presentes/aparelho-de-jantar.webp',
          status: 'available',
        },
        {
          id: 3.00,
          name: 'Airfryer 220v',
          description: 'Fritadeira elétrica para preparar alimentos com rapidez.',
          price: 420.00,
          image_url: '/Lista-presentes/air-frayer.webp',
          status: 'available',
        },
        {
          id: 4.00,
          name: 'Liquidificador 220v',
          description: 'Para preparar sucos, vitaminas e receitas.',
          price: 105.00,
          image_url: '/Lista-presentes/liquidificador.webp',
          status: 'available',
        },
        {
          id: 5.00,
          name: 'Conjunto de Taças',
          description: 'Taças de vidro para brindar momentos especiais.',
          price: 157.50,
          image_url: '/Lista-presentes/jogo_de_tacas.webp',
          status: 'available',
        },
        {
          id: 6.00,
          name: 'Faqueiro Inox',
          description: 'Conjunto de talheres em aço inox.',
          price: 84.00,
          image_url: '/Lista-presentes/talheres.jpg',
          status: 'available',
        },
        {
          id: 8.00,
          name: 'Batedeira Planetária',
          description: 'Batedeira para auxiliar no preparo de receitas.',
          price: 367.50,
          image_url: '/Lista-presentes/batedeira.webp',
          status: 'available',
        },
        {
          id: 10.00,
          name: 'Micro-ondas 220v',
          description: 'Micro-ondas para aquecer as refeições.',
          price: 609.00,
          image_url: '/Lista-presentes/microondas.png',
          status: 'available',
        },
        {
          id: 11.00,
          name: 'Sanduicheira 220v',
          description: 'Sanduicheira para fazer lanches.',
          price: 84.00,
          image_url: '/Lista-presentes/sanduicheira.png',
          status: 'available',
        },
        {
          id: 12.00,
          name: 'Gelagua ou Bebedouro',
          description: 'Gelagua para termos água gelada sempre à disposição.',
          price: 472.50,
          image_url: '/Lista-presentes/gelagua.png',
          status: 'available',
        },
        {
          id: 13.00,
          name: 'Ventilador de Coluna',
          description: 'Ventilador para os dias quentes.',
          price: 189.00,
          image_url: '/Lista-presentes/ventilador.png',
          status: 'available',
        },
        {
          id: 14.00,
          name: 'Conjunto de Copos',
          description: 'Copos de vidro para uso diário.',
          price: 84.00,
          image_url: '/Lista-presentes/conjunto_copos.png',
          status: 'available',
        },
        {
          id: 15.00,
          name: 'Jogo de Assadeiras e Travessas',
          description: 'Travessas de vidro para assar e servir.',
          price: 189.00,
          image_url: '/Lista-presentes/assadeira.png',
          status: 'available',
        },
        {
          id: 16.00,
          name: 'Conjunto de Potes para Mantimentos',
          description: 'Conjunto de potes organizadores.',
          price: 126.00,
          image_url: '/Lista-presentes/potes_mantimento.png',
          status: 'available',
        },
        {
          id: 19.00,
          name: 'Kit para Churrasco',
          description: 'Faca, garfo e pegador para churrasco.',
          price: 168.00,
          image_url: '/Lista-presentes/kit_churrasco.png',
          status: 'available',
        },
        {
          id: 20.00,
          name: 'Escorredor de louça',
          description: 'Escorredor de louças para a cozinha.',
          price: 115.50,
          image_url: '/Lista-presentes/escorredor_louca.png',
          status: 'available',
        },
        {
          id: 21.00,
          name: 'Boleira de Vidro',
          description: 'Boleira com tampa de vidro.',
          price: 94.50,
          image_url: '/Lista-presentes/boleira_vidro.png',
          status: 'available',
        },
        {
          id: 22.00,
          name: 'Conjunto de Talheres de Sobremesa',
          description: 'Talheres pequenos para servir sobremesas.',
          price: 63.00,
          image_url: '/Lista-presentes/talheres_sobremesa.png',
          status: 'available',
        },
        {
          id: 23.00,
          name: 'Jogo de Lençol de Algodão Queen',
          description: 'Jogo de lençol queen de algodão.',
          price: 262.50,
          image_url: '/Lista-presentes/lencol_queen.png',
          status: 'available',
        },
        {
          id: 24.00,
          name: 'Edredom Queen Cobre-Leito',
          description: 'Edredom queen confortável.',
          price: 336.00,
          image_url: '/Lista-presentes/edredom_queen.png',
          status: 'available',
        },
        {
          id: 25.00,
          name: 'Kit de Travesseiros Confort',
          description: 'Travesseiros para o quarto.',
          price: 126.00,
          image_url: '/Lista-presentes/travesseiros.png',
          status: 'available',
        },
        {
          id: 26.00,
          name: 'Protetor de Colchão Impermeável',
          description: 'Protetor impermeável para colchão queen.',
          price: 115.50,
          image_url: '/Lista-presentes/protetor_colchao.png',
          status: 'available',
        },
        {
          id: 27.00,
          name: 'Jogo de Toalhas de Banho',
          description: 'Jogo de toalhas de banho.',
          price: 189.00,
          image_url: '/Lista-presentes/toalhas_banho.png',
          status: 'available',
        },
        {
          id: 28.00,
          name: 'Toalhas de Mesa e Jogo Americano',
          description: 'Toalha de mesa e jogo americano.',
          price: 126.00,
          image_url: '/Lista-presentes/toalhas_mesa.png',
          status: 'available',
        },
        {
          id: 30.00,
          name: 'Lixeira de Inox (Cozinha/Banheiro)',
          description: 'Lixeira de inox com pedal.',
          price: 94.50,
          image_url: 'https://plus.unsplash.com/premium_photo-1664189121552-f6d1dbf2a45c?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 31.00,
          name: 'Porta-sabonete Líquido e Porta-escovas',
          description: 'Porta-sabonete líquido e porta-escovas para banheiro.',
          price: 78.75,
          image_url: 'https://plus.unsplash.com/premium_photo-1679064286720-9f28c0f012d8?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 32.00,
          name: 'Tábua de Passar Roupa',
          description: 'Tábua de passar roupa.',
          price: 136.50,
          image_url: 'https://images.unsplash.com/photo-1540544093-b0880061e1a5?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 33.00,
          name: 'Fruteira de Mesa',
          description: 'Fruteira para mesa.',
          price: 115.50,
          image_url: 'https://images.unsplash.com/photo-1605280179505-db8b72e318b7?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 35.00,
          name: 'Mesa de Centro de Sala',
          description: 'Mesa de centro para sala.',
          price: 262.50,
          image_url: 'https://images.unsplash.com/photo-1724582586580-8b52c02e99dd?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 36.00,
          name: 'Sapateira Organizadora',
          description: 'Sapateira organizadora.',
          price: 136.50,
          image_url: 'https://images.unsplash.com/photo-1478887011962-709960f8ced8?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 37.00,
          name: 'Panela de Pressão Cerâmica',
          description: 'Panela de pressão com revestimento cerâmico, segura e eficiente.',
          price: 262.50,
          image_url: '/Lista-presentes/panela_pressao_ceramica.png',
          status: 'available',
        },
        {
          id: 38.00,
          name: 'Panela de pressão elétrica',
          description: 'Panela de pressão elétrica multifuncional para facilitar o dia a dia.',
          price: 399.00,
          image_url: '/Lista-presentes/panela_pressao_eletrica.png',
          status: 'available',
        },
        {
          id: 39.00,
          name: 'Kit 6 Jogo Americano Redondo Sousplat Supla Mesa Posta',
          description: 'Conjunto com 6 sousplats redondos para uma mesa posta elegante.',
          price: 63.00,
          image_url: '/Lista-presentes/jogo_americano_sousplat.png',
          status: 'available',
        },
        {
          id: 40.00,
          name: 'Jogo Com 6 Taças De Sobremesa Diamante',
          description: 'Conjunto com 6 taças de vidro estilo diamante para sobremesa.',
          price: 63.00,
          image_url: '/Lista-presentes/tacas_sobremesa_diamante.png',
          status: 'available',
        },
        {
          id: 41.00,
          name: 'Luminária De Mesa Abajur',
          description: 'Luminária de mesa/abajur com design moderno para quarto ou escritório.',
          price: 73.50,
          image_url: '/Lista-presentes/luminaria_mesa_abajur.png',
          status: 'available',
        },
        {
          id: 42.00,
          name: 'Mop Giratório Esfregão Cesto Inox',
          description: 'Mop giratório com esfregão e cesto em aço inox para limpeza prática.',
          price: 73.50,
          image_url: '/Lista-presentes/mop_giratorio_inox.png',
          status: 'available',
        },
        {
          id: 43.00,
          name: 'Kit 3 Formas Para Bolo Torta Antiaderente',
          description: 'Conjunto com 3 formas antiaderentes de tamanhos variados para bolo e torta.',
          price: 52.50,
          image_url: '/Lista-presentes/formas_bolo_antiaderente.png',
          status: 'available',
        },
        {
          id: 44.00,
          name: 'Kit Jarra de Vidro e Copos De Vidro',
          description: 'Jogo com jarra e copos de vidro trabalhados para servir bebidas.',
          price: 136.50,
          image_url: '/Lista-presentes/kit_jarra_copos_vidro.png',
          status: 'available',
        },
        {
          id: 45.00,
          name: 'Kit 2 Mantas Para Sofá',
          description: 'Conjunto com 2 mantas aconchegantes e decorativas para sofá.',
          price: 63.00,
          image_url: '/Lista-presentes/kit_mantas_sofa.png',
          status: 'available',
        },
        {
          id: 46.00,
          name: 'Kit 10 Potes Vidro Hermético',
          description: 'Conjunto de 10 potes de vidro com tampa hermética para conservar alimentos.',
          price: 105.00,
          image_url: '/Lista-presentes/kit_potes_hermetico.png',
          status: 'available',
        },
        {
          id: 47.00,
          name: 'Espelho 90x40cm Corpo Inteiro',
          description: 'Espelho retangular grande para corpo inteiro com moldura discreta.',
          price: 105.00,
          image_url: '/Lista-presentes/espelho_corpo_inteiro.png',
          status: 'available',
        },
        {
          id: 48.00,
          name: 'Frigideira Cerâmica Antiaderente',
          description: 'Frigideira com revestimento cerâmico antiaderente para grelhar com facilidade.',
          price: 84.00,
          image_url: '/Lista-presentes/frigideira_ceramica.png',
          status: 'available',
        },
        {
          id: 49.00,
          name: 'Relógio De Parede 30cm Grande',
          description: 'Relógio de parede moderno e silencioso de 30cm para decoração da casa.',
          price: 63.00,
          image_url: '/Lista-presentes/relogio_parede.png',
          status: 'available',
        },
        {
          id: 50.00,
          name: 'Organizador Giratório de Temperos 360°',
          description: 'Organizador giratório 360 graus para temperos e condimentos na cozinha.',
          price: 73.50,
          image_url: '/Lista-presentes/organizador_temperos.png',
          status: 'available',
        },
        {
          id: 51.00,
          name: 'Kit Bowls Tigelas de Inox com Tampa Plástica, 3 Unidades',
          description: 'Conjunto com 3 tigelas de aço inox com tampas plásticas para conservar alimentos.',
          price: 105.00,
          image_url: '/Lista-presentes/kit_bowls_inox.png',
          status: 'available',
        },
        {
          id: 52.00,
          name: 'Pipoqueira 220V',
          description: 'Pipoqueira elétrica 220V para fazer pipoca crocante e saudável sem óleo.',
          price: 157.50,
          image_url: '/Lista-presentes/pipoqueira_eletrica.png',
          status: 'available',
        },
        {
          id: 53.00,
          name: 'Multiprocessador 220v',
          description: 'Multiprocessador potente de alimentos 220V para triturar, fatiar e ralar.',
          price: 315.00,
          image_url: '/Lista-presentes/multiprocessador.png',
          status: 'available',
        },
        {
          id: 55.00,
          name: 'Ferro De Passar Roupa A Seco',
          description: 'Ferro de passar a seco clássico e eficiente.',
          price: 147.00,
          image_url: '/Lista-presentes/ferro_seco.png',
          status: 'available',
        },
        {
          id: 56.00,
          name: 'Aspirador de Pó Vertical 220v',
          description: 'Aspirador 2 em 1 de 1450W com filtro HEPA.',
          price: 199.50,
          image_url: '/Lista-presentes/aspirador-vertical.png',
          status: 'available',
        },
        {
          id: 54.00,
          name: 'operação lua de mel',
          description: 'Ajude os noivos a curtirem a lua de mel com qualquer valor ou cotas.',
          price: 105.00,
          image_url: '/Lista-presentes/operacao_lua_de_mel.png',
          status: 'available',
        }
      ]);
    }
  };

  useEffect(() => {
    fetchGifts();
    fetchRsvps();
  }, []);

  // Fetch RSVPs from Backend / Guests
  const fetchRsvps = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users-module`);
      if (response.ok) {
        const data: GuestItem[] = await response.json();
        setGuestsList(data);
        setAdminRsvps(data);
      } else {
        throw new Error('Falha ao buscar lista de convidados');
      }
    } catch (err) {
      console.warn('Backend indisponível para carregar convidados. Usando lista local.', err);
      // Fallback: create offline guest list from DEFAULT_GUESTS_LIST
      setGuestsList(prev => {
        if (prev.length > 0) return prev;
        return DEFAULT_GUESTS_LIST.map((name, index) => ({
          id: index + 1,
          name,
          confirmed_presence: false,
          has_absentees: false,
        }));
      });
      setAdminRsvps(prev => {
        if (prev.length > 0) return prev;
        return DEFAULT_GUESTS_LIST.map((name, index) => ({
          id: index + 1,
          name,
          confirmed_presence: false,
          has_absentees: false,
        }));
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-fetch RSVPs if admin is logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchRsvps();
    }
  }, [isAdminLoggedIn]);

  // Admin Actions
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === 'jacielielucas1601' && adminPass === 'uvlef12092002') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      setIsAdminOpen(false);
      setAdminUser('');
      setAdminPass('');
      setAdminError('');
      fetchRsvps();
      fetchGifts();
      showToast('Login de administrador efetuado!');
    } else {
      setAdminError('Usuário ou senha incorretos.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    showToast('Sessão de administrador encerrada.');
  };

  const handleAdminRefresh = async () => {
    await Promise.all([fetchRsvps(), fetchGifts()]);
    showToast('Dados atualizados com sucesso!');
  };

  const handleAdminUnclaim = async (giftId: number, giftName: string) => {
    if (!window.confirm(`Tem certeza que deseja liberar o presente "${giftName}"? Ele voltará a ficar disponível.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/unclaim`, {
        method: 'POST',
      });
      if (response.ok) {
        showToast(`Presente "${giftName}" liberado com sucesso!`);
        fetchGifts();
      } else {
        throw new Error('Erro ao liberar presente.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao liberar o presente.');
    }
  };

  const handleAdminConfirm = async (giftId: number, giftName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/confirm`, {
        method: 'POST',
      });
      if (response.ok) {
        showToast(`Recebimento do presente "${giftName}" confirmado!`);
        fetchGifts();
      } else {
        throw new Error('Erro ao confirmar presente.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao confirmar o presente.');
    }
  };

  const handleAdminResetRsvp = async (rsvpId: number, name: string) => {
    if (!window.confirm(`Deseja realmente redefinir a confirmação de "${name}" para pendente?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users-module/${rsvpId}/reset`, {
        method: 'POST',
      });
      if (response.ok) {
        showToast(`Confirmação de "${name}" redefinida para pendente.`);
        fetchRsvps();
      } else {
        throw new Error('Erro ao redefinir RSVP.');
      }
    } catch (err) {
      console.warn('API indisponível, redefinindo localmente.', err);
      setGuestsList(prev => prev.map(g => g.id === rsvpId ? { ...g, confirmed_presence: false, has_absentees: false, absent_names: null, confirmed_at: null } : g));
      setAdminRsvps(prev => prev.map(g => g.id === rsvpId ? { ...g, confirmed_presence: false, has_absentees: false, absent_names: null, confirmed_at: null } : g));
      showToast(`Confirmação de "${name}" redefinida localmente.`);
    }
  };

  const handleAdminDeleteRsvp = async (rsvpId: number, name: string) => {
    if (!window.confirm(`Deseja realmente excluir o convite de "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users-module/${rsvpId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast(`Convite de "${name}" excluído.`);
        fetchRsvps();
      } else {
        throw new Error('Erro ao excluir RSVP.');
      }
    } catch (err) {
      console.warn('API indisponível, excluindo localmente.', err);
      setGuestsList(prev => prev.filter(g => g.id !== rsvpId));
      setAdminRsvps(prev => prev.filter(g => g.id !== rsvpId));
      showToast(`Convite de "${name}" excluído localmente.`);
    }
  };

  const handleAdminChangeQuantity = async (giftId: number, value: string) => {
    let qty = 1;
    if (value === 'ilimitado') {
      qty = -1;
    } else {
      qty = parseInt(value, 10);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ available_quantity: qty })
      });

      if (response.ok) {
        showToast('Quantidade atualizada com sucesso!');
        fetchGifts();
      } else {
        throw new Error('Erro ao atualizar quantidade.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar quantidade.');
    }
  };

  // Show Toast Message
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Copy to clipboard utility
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado com sucesso!`);
  };

  // RSVP Form Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) {
      showToast('Por favor, selecione seu nome na lista de convidados.');
      return;
    }
    if (hasAbsentees === null) {
      showToast('Por favor, informe se alguém não poderá comparecer.');
      return;
    }
    if (hasAbsentees && !absentNames.trim()) {
      showToast('Por favor, informe o nome de quem NÃO vai comparecer.');
      return;
    }

    setRsvpSubmitting(true);
    const rsvpPayload = {
      has_absentees: hasAbsentees,
      absent_names: hasAbsentees ? absentNames.trim() : null,
      phone: rsvpPhone || null,
      message: rsvpMessage || null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users-module/${selectedGuest.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpPayload),
      });

      if (response.ok) {
        const updated = await response.json();
        setGuestsList(prev => prev.map(g => g.id === selectedGuest.id ? updated : g));
        setAdminRsvps(prev => prev.map(g => g.id === selectedGuest.id ? updated : g));
        setLastConfirmedGuestName(selectedGuest.name || selectedGuest.firstname || '');
        setRsvpSubmitted(true);
        showToast('Presença confirmada com sucesso!');
      } else {
        throw new Error('Erro na resposta do servidor.');
      }
    } catch (error) {
      console.warn('API indisponível, registrando localmente.', error);
      const updatedLocal: GuestItem = {
        ...selectedGuest,
        confirmed_presence: true,
        has_absentees: hasAbsentees,
        absent_names: hasAbsentees ? absentNames.trim() : null,
        phone: rsvpPhone || null,
        message: rsvpMessage || null,
        confirmed_at: new Date().toISOString(),
      };
      setGuestsList(prev => prev.map(g => g.id === selectedGuest.id ? updatedLocal : g));
      setAdminRsvps(prev => prev.map(g => g.id === selectedGuest.id ? updatedLocal : g));
      setLastConfirmedGuestName(selectedGuest.name || selectedGuest.firstname || '');
      setRsvpSubmitted(true);
      showToast('Presença confirmada localmente.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Claim Gift Form Submit (confirm payment or intent to purchase)
  const handleClaimGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGift) return;

    if (!buyerName || !buyerPhone) {
      showToast('Por favor, preencha seu nome e telefone.');
      return;
    }

    if (selectedGift.id === 0) {
      const amountNum = parseFloat(customAmount);
      if (isNaN(amountNum) || amountNum < 1) {
        showToast('Por favor, insira um valor de pelo menos R$ 1,00.');
        return;
      }
      showToast(`Obrigado pela sua contribuição de ${formatBRL(amountNum)}!`);
      setSelectedGift(null);
      setBuyerName('');
      setBuyerPhone('');
      return;
    }

    setClaimSubmitting(true);

    const claimPayload = {
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      payment_method: modalTab === 'pix' ? 'pix' : 'external_purchase'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/gifts/${selectedGift.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(claimPayload)
      });

      if (response.ok) {
        showToast(`Presente "${selectedGift.name}" reservado com sucesso!`);
        setSelectedGift(null);
        setBuyerName('');
        setBuyerPhone('');
        fetchGifts(); // Refresh list from backend
      } else {
        throw new Error('Não foi possível reservar o presente.');
      }
    } catch (error) {
      console.error(error);
      // Offline fallback state update
      setGifts(prevGifts =>
        prevGifts.map(g => g.id === selectedGift.id ? {
          ...g,
          status: 'claimed',
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          payment_method: modalTab === 'pix' ? 'pix' : 'external_purchase'
        } : g)
      );
      showToast(`Reserva do presente salva localmente (Offline).`);
      setSelectedGift(null);
      setBuyerName('');
      setBuyerPhone('');
    } finally {
      setClaimSubmitting(false);
    }
  };

  // Group gifts by name to support limits without displaying them
  const groupedGifts = React.useMemo(() => {
    const grouped: Record<string, GiftItem[]> = {};
    for (const gift of gifts) {
      if (!grouped[gift.name]) {
        grouped[gift.name] = [];
      }
      grouped[gift.name].push(gift);
    }

    return Object.keys(grouped).map(name => {
      const items = grouped[name];
      const availableItem = items.find(item => item.status === 'available' && item.available_quantity !== 0);
      if (availableItem) return availableItem;

      const claimedItem = items.find(item => item.status === 'claimed');
      if (claimedItem) return { ...claimedItem, status: 'claimed' } as GiftItem;

      const confirmedItem = items.find(item => item.status === 'confirmed');
      if (confirmedItem) return { ...confirmedItem, status: 'confirmed' } as GiftItem;

      return { ...items[0], status: 'claimed' } as GiftItem;
    });
  }, [gifts]);

  // Filter gifts by price
  const filteredGifts = groupedGifts.filter(gift => {
    const priceNum = typeof gift.price === 'number' ? gift.price : parseFloat(gift.price);
    if (filter === 'all') return true;
    if (filter === 'low') return priceNum <= 200;
    if (filter === 'mid') return priceNum > 200 && priceNum <= 500;
    if (filter === 'high') return priceNum > 500;
    return true;
  });

  // Format currency in Reais
  const formatBRL = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? 'R$ 0,00' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };


  if (isAdminLoggedIn) {
    return (
      <div className="admin-dashboard animate-fade-in">
        <header className="admin-header">
          <div className="admin-brand">
            <Heart className="heart-icon" size={20} fill="var(--gold-primary)" color="var(--gold-primary)" />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600 }}>Painel dos Noivos</span>
          </div>
          <div className="admin-header-actions">
            <button onClick={handleAdminRefresh} className="btn-refresh" title="Atualizar dados" disabled={isRefreshing}>
              <RefreshCw className={isRefreshing ? "spin-animation" : ""} size={16} />
            </button>
            <button onClick={handleAdminLogout} className="btn-logout">
              <LogOut size={16} /> Sair do Painel
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${adminTab === 'rsvps' ? 'active' : ''}`}
              onClick={() => setAdminTab('rsvps')}
            >
              <Users size={16} /> RSVPs ({adminRsvps.length})
            </button>
            <button
              className={`admin-tab ${adminTab === 'gifts' ? 'active' : ''}`}
              onClick={() => setAdminTab('gifts')}
            >
              <Gift size={16} /> Presentes ({gifts.length})
            </button>
          </div>

          {adminTab === 'rsvps' ? (
            <div className="admin-section-panel">
              <div className="admin-section-header">
                <h2>Lista de Convidados (RSVP)</h2>
              </div>

              {/* Summary Stats Grid */}
              <div className="admin-summary-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{adminRsvps.length}</div>
                  <div className="admin-stat-label">Total de Convites</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value" style={{ color: 'var(--accent-olive)' }}>
                    {adminRsvps.filter(r => r.confirmed_presence).length}
                  </div>
                  <div className="admin-stat-label">Confirmados</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value" style={{ color: '#B23B37' }}>
                    {adminRsvps.filter(r => r.confirmed_presence && r.has_absentees).length}
                  </div>
                  <div className="admin-stat-label">Com Ausentes</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value" style={{ color: '#78909C' }}>
                    {adminRsvps.filter(r => !r.confirmed_presence).length}
                  </div>
                  <div className="admin-stat-label">Pendentes</div>
                </div>
              </div>

              <div className="admin-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Pesquisar convite..."
                  className="admin-search-input"
                  style={{ flex: '1', minWidth: '220px' }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />

                <div className="admin-filter-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className={`btn-filter ${adminRsvpFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setAdminRsvpFilter('all')}
                  >
                    Todos ({adminRsvps.length})
                  </button>
                  <button
                    className={`btn-filter ${adminRsvpFilter === 'confirmed' ? 'active' : ''}`}
                    onClick={() => setAdminRsvpFilter('confirmed')}
                  >
                    Confirmados ({adminRsvps.filter(r => r.confirmed_presence).length})
                  </button>
                  <button
                    className={`btn-filter ${adminRsvpFilter === 'absentees' ? 'active' : ''}`}
                    onClick={() => setAdminRsvpFilter('absentees')}
                  >
                    Com Ausentes ({adminRsvps.filter(r => r.confirmed_presence && r.has_absentees).length})
                  </button>
                  <button
                    className={`btn-filter ${adminRsvpFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setAdminRsvpFilter('pending')}
                  >
                    Pendentes ({adminRsvps.filter(r => !r.confirmed_presence).length})
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Convite / Família</th>
                      <th>Status</th>
                      <th>Comparecimento</th>
                      <th>Contato</th>
                      <th>Mensagem</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRsvps
                      .filter(rsvp => {
                        const name = (rsvp.name || `${rsvp.firstname || ''} ${rsvp.lastname || ''}`).toLowerCase();
                        const matchesSearch = name.includes(adminSearch.toLowerCase());
                        if (!matchesSearch) return false;

                        if (adminRsvpFilter === 'confirmed') return rsvp.confirmed_presence;
                        if (adminRsvpFilter === 'pending') return !rsvp.confirmed_presence;
                        if (adminRsvpFilter === 'absentees') return rsvp.confirmed_presence && rsvp.has_absentees;
                        return true;
                      })
                      .map(rsvp => (
                        <tr key={rsvp.id}>
                          <td>{rsvp.id}</td>
                          <td><strong>{rsvp.name || `${rsvp.firstname || ''} ${rsvp.lastname || ''}`.trim()}</strong></td>
                          <td>
                            <span className={`status-badge ${rsvp.confirmed_presence ? 'status-confirmed' : 'status-declined'}`}>
                              {rsvp.confirmed_presence ? 'Confirmado' : 'Pendente'}
                            </span>
                          </td>
                          <td>
                            {rsvp.confirmed_presence ? (
                              rsvp.has_absentees ? (
                                <span className="badge-has-absentees" title={rsvp.absent_names || ''}>
                                  Não vai: <strong>{rsvp.absent_names || 'Não especificado'}</strong>
                                </span>
                              ) : (
                                <span className="badge-all-present">Todos irão</span>
                              )
                            ) : (
                              <span className="badge-pending">Aguardando resposta</span>
                            )}
                          </td>
                          <td style={{ fontSize: '13px' }}>
                            {rsvp.phone ? rsvp.phone : '-'}
                          </td>
                          <td className="admin-table-message" title={rsvp.message || ''}>
                            {rsvp.message || '-'}
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {rsvp.confirmed_at ? new Date(rsvp.confirmed_at).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {rsvp.confirmed_presence && (
                                <button
                                  onClick={() => handleAdminResetRsvp(rsvp.id, rsvp.name || rsvp.firstname || '')}
                                  className="btn-action"
                                  style={{ color: '#E65100', borderColor: '#FFE0B2', background: '#FFF8E1' }}
                                  title="Redefinir para pendente"
                                >
                                  <RotateCcw size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => handleAdminDeleteRsvp(rsvp.id, rsvp.name || rsvp.firstname || '')}
                                className="btn-action btn-delete"
                                title="Remover Convite"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {adminRsvps.length === 0 && (
                      <tr>
                        <td colSpan={8} className="empty-row">Nenhum convite encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="admin-section-panel">
              <div className="admin-section-header">
                <h2>Gerenciamento de Presentes</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="admin-summary-badge">
                    Reservados: <strong>{gifts.filter(g => g.status === 'claimed').length}</strong>
                  </div>
                  <div className="admin-summary-badge">
                    Confirmados: <strong>{gifts.filter(g => g.status === 'confirmed').length}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-filters">
                <div className="admin-filter-tabs">
                  <button
                    className={`filter-btn ${adminGiftFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setAdminGiftFilter('all')}
                  >
                    Todos ({gifts.length})
                  </button>
                  <button
                    className={`filter-btn ${adminGiftFilter === 'claimed' ? 'active' : ''}`}
                    onClick={() => setAdminGiftFilter('claimed')}
                  >
                    Reservados ({gifts.filter(g => g.status === 'claimed').length})
                  </button>
                  <button
                    className={`filter-btn ${adminGiftFilter === 'confirmed' ? 'active' : ''}`}
                    onClick={() => setAdminGiftFilter('confirmed')}
                  >
                    Confirmados ({gifts.filter(g => g.status === 'confirmed').length})
                  </button>
                  <button
                    className={`filter-btn ${adminGiftFilter === 'available' ? 'active' : ''}`}
                    onClick={() => setAdminGiftFilter('available')}
                  >
                    Disponíveis ({gifts.filter(g => g.status === 'available').length})
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Presente</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Disponíveis</th>
                      <th>Comprador</th>
                      <th>Telefone</th>
                      <th>Canal</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts
                      .filter(g => {
                        if (adminGiftFilter === 'all') return true;
                        return g.status === adminGiftFilter;
                      })
                      .map(g => (
                        <tr key={g.id}>
                          <td>{g.id}</td>
                          <td><strong>{g.name}</strong></td>
                          <td>{formatBRL(g.price)}</td>
                          <td>
                            <span className={`status-badge status-${g.status}`}>
                              {g.status === 'available' ? 'Disponível' : g.status === 'claimed' ? 'Reservado' : 'Confirmado'}
                            </span>
                          </td>
                          <td>
                            {g.status === 'available' ? (
                              <select
                                className="admin-quantity-select"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--gold-light)',
                                  outline: 'none',
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: '13px'
                                }}
                                value={g.available_quantity === -1 ? 'ilimitado' : String(g.available_quantity ?? 1)}
                                onChange={e => handleAdminChangeQuantity(g.id, e.target.value)}
                              >
                                <option value="0">0 (Reservado)</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="ilimitado">Ilimitado</option>
                              </select>
                            ) : (
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                {g.status === 'claimed' ? 'Reservado' : 'Confirmado'}
                              </span>
                            )}
                          </td>
                          <td>{g.buyer_name || '-'}</td>
                          <td>{g.buyer_phone || '-'}</td>
                          <td>
                            {g.payment_method === 'pix' ? 'PIX' : g.payment_method === 'external_purchase' ? 'Loja Externa' : '-'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {(g.status === 'claimed' || g.status === 'confirmed') && (
                                <button
                                  onClick={() => handleAdminUnclaim(g.id, g.name)}
                                  className="btn-action btn-release"
                                  title="Liberar presente (tornar disponível)"
                                >
                                  Liberar
                                </button>
                              )}
                              {g.status === 'claimed' && (
                                <button
                                  onClick={() => handleAdminConfirm(g.id, g.name)}
                                  className="btn-action btn-confirm-receive"
                                  title="Confirmar recebimento do presente"
                                >
                                  Confirmar
                                </button>
                              )}
                              {g.status === 'available' && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sem ações</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {gifts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="empty-row">Nenhum presente encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {toastMessage && (
          <div className="toast">
            <Check size={18} color="var(--accent-olive)" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Floating Navbar */}
      <nav className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/J.png" alt="J & L Monograma" style={{ height: '48px', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600 }}>Jacieli & Lucas</span>
        </div>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Alternar menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Overlay backdrop when mobile menu drawer is open */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="#inicio" onClick={() => { setActiveSection('inicio'); setIsMobileMenuOpen(false); }} className={`nav-link ${activeSection === 'inicio' ? 'active' : ''}`}>Início</a>
          <a href="#detalhes" onClick={() => { setActiveSection('detalhes'); setIsMobileMenuOpen(false); }} className={`nav-link ${activeSection === 'detalhes' ? 'active' : ''}`}>Celebração</a>
          <a href="#historia" onClick={() => { setActiveSection('historia'); setIsMobileMenuOpen(false); }} className={`nav-link ${activeSection === 'historia' ? 'active' : ''}`}>Nossa História</a>
          <a href="#rsvp" onClick={() => { setActiveSection('rsvp'); setIsMobileMenuOpen(false); }} className={`nav-link ${activeSection === 'rsvp' ? 'active' : ''}`}>RSVP</a>
          <a href="#presentes" onClick={() => { setActiveSection('presentes'); setIsMobileMenuOpen(false); }} className={`nav-link ${activeSection === 'presentes' ? 'active' : ''}`}>Lista de Presentes</a>
        </div>
      </nav>

      <div className="fade-in">

        {/* Hero Section */}
        <section id="inicio" className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <div style={{ marginBottom: '15px' }}>
                <img src="/J.png" alt="Monograma" style={{ height: '130px', objectFit: 'contain' }} />
              </div>
              <span className="hero-subtitle">Convidamos você para celebrar</span>
              <h1 className="hero-title">O Casamento de <br /> Jacieli & Lucas</h1>
              <p className="hero-date">16 de Janeiro de 2027 • 16h30</p>

              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                Faltam apenas alguns dias para iniciarmos esse novo capítulo de nossas vidas.
              </p>

              {/* Countdown Clock */}
              <div className="countdown-container">
                <div className="countdown-box">
                  <div className="countdown-num">{timeLeft.days}</div>
                  <div className="countdown-label">Dias</div>
                </div>
                <div className="countdown-box">
                  <div className="countdown-num">{timeLeft.hours}</div>
                  <div className="countdown-label">Horas</div>
                </div>
                <div className="countdown-box">
                  <div className="countdown-num">{timeLeft.minutes}</div>
                  <div className="countdown-label">Mins</div>
                </div>
                <div className="countdown-box">
                  <div className="countdown-num">{timeLeft.seconds}</div>
                  <div className="countdown-label">Segs</div>
                </div>
              </div>
            </div>

            <div className="hero-img-wrapper">
              <img
                src="/couple_church.jpg"
                alt="Jacieli e Lucas"
                className="hero-img"
                onError={(e) => {
                  // fallback image
                  (e.target as HTMLImageElement).src = "/1.png";
                }}
              />
            </div>
          </div>
        </section>

        {/* Details of Ceremony and Reception */}
        <section id="detalhes" className="section">
          <h2 className="section-title">A Cerimônia & Recepção</h2>
          <p className="section-subtitle">Onde e quando tudo vai acontecer</p>

          <div className="details-grid">
            {/* Ceremony Card */}
            <div className="details-card">
              <div className="details-icon">
                <Heart size={32} />
              </div>
              <h3 className="details-name">A Celebração Religiosa</h3>
              <div className="details-img-container">
                <img
                  src="/igreja_matriz.jpg"
                  alt="Matriz de Nossa Senhora de Lourdes - Local da Celebração Religiosa"
                  className="details-card-img"
                  loading="lazy"
                />
              </div>
              <div className="details-info">
                <Calendar size={18} />
                <span>Sábado, 16 de Janeiro de 2027</span>
              </div>
              <div className="details-info">
                <Clock size={18} />
                <span>Às 16h30</span>
              </div>
              <div className="details-info">
                <MapPin size={18} />
                <span>Matriz de Nossa Senhora de Lourdes</span>
              </div>
              <p className="details-description">
                A cerimônia será realizada na Matriz de Nossa Senhora de Lourdes, na cidade de Campo Redondo/RN. Esperamos você para testemunhar o nosso matrimônio.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Matriz+de+Nossa+Senhora+de+Lourdes+Campo+Redondo+RN"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-map"
              >
                <Navigation size={16} /> Ver no Google Maps
              </a>
            </div>

            {/* Reception Card */}
            <div className="details-card">
              <div className="details-icon">
                <Wine size={32} />
              </div>
              <h3 className="details-name">A Recepção</h3>
              <div className="details-img-container">
                <img
                  src="/chacara_por_do_sol.jpg"
                  alt="Chácara Por do Sol - Local da Recepção"
                  className="details-card-img"
                  loading="lazy"
                />
              </div>
              <div className="details-info">
                <Calendar size={18} />
                <span>Sábado, 16 de Janeiro de 2027</span>
              </div>
              <div className="details-info">
                <Clock size={18} />
                <span>Logo após a celebração</span>
              </div>
              <div className="details-info">
                <MapPin size={18} />
                <span>Chácara Por do Sol, Sítio Ramal</span>
              </div>
              <p className="details-description">
                Após a cerimônia religiosa, convidamos todos para comemorar conosco com uma linda festa na chácara Por do Sol, no sítio Ramal, em Campo Redondo/RN.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=-6.218960255117028,-36.175959358088534"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-map"
              >
                <Navigation size={16} /> Ver no Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section id="historia" className="section section-alt">
          <div className="section-content">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <img src="/2.png" alt="Ornamento" style={{ height: '50px', objectFit: 'contain', opacity: 0.8 }} />
            </div>
            <h2 className="section-title">Nossa História</h2>

            <div className="timeline">

              <div className="timeline-item timeline-right">
                <div className="timeline-content">
                  <div className="timeline-date">Novembro de 2023</div>
                  <h3 className="timeline-title">O Início de Tudo</h3>
                  <p className="timeline-desc">O pedido de namoro oficializou o que nossos corações já gritavam. Jacieli e Lucas começam a trilhar o caminho em Deus que os levaria ao altar.</p>
                </div>
              </div>

              <div className="timeline-item timeline-left">
                <div className="timeline-content">
                  <div className="timeline-date">Março de 2026</div>
                  <h3 className="timeline-title">O Pedido</h3>
                  <p className="timeline-desc">Confiantes na intercessão de São José, Lucas fez o pedido mais especial de sua vida e Jacieli respondeu com o "Sim!" mais alegre.</p>
                </div>
              </div>

              <div className="timeline-item timeline-right">
                <div className="timeline-content">
                  <div className="timeline-date">16 de Janeiro de 2027</div>
                  <h3 className="timeline-title">O Grande Dia</h3>
                  <p className="timeline-desc">Diante de Deus e de nossos queridos amigos e familiares, nasce uma nova família.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RSVP Component */}
        <section id="rsvp" className="section">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <img src="/2.png" alt="Ornamento" style={{ height: '50px', objectFit: 'contain', opacity: 0.8 }} />
          </div>
          <h2 className="section-title">Confirmação de Presença</h2>
          <p className="section-subtitle">Por favor, digite seu nome e confirme sua presença até 15 de Dezembro de 2026</p>

          <div className="rsvp-container">
            {!rsvpSubmitted ? (
              <form onSubmit={handleRsvpSubmit}>
                {/* 1. Seleção do Convidado */}
                <div className="form-group">
                  <label className="form-label">Digite seu nome ou família</label>
                  {!selectedGuest ? (
                    <div className="rsvp-search-container">
                      <div className="rsvp-input-wrapper">
                        <Search size={18} className="rsvp-search-icon" />
                        <input
                          type="text"
                          className="form-input rsvp-search-input"
                          placeholder="Digite seu nome..."
                          value={guestSearchQuery}
                          onChange={(e) => {
                            setGuestSearchQuery(e.target.value);
                            setIsSearchDropdownOpen(e.target.value.trim().length > 0);
                          }}
                          onFocus={() => {
                            if (guestSearchQuery.trim().length > 0) {
                              setIsSearchDropdownOpen(true);
                            }
                          }}
                        />
                      </div>

                      {isSearchDropdownOpen && guestSearchQuery.trim().length > 0 && (
                        <ul className="rsvp-dropdown">
                          {(() => {
                            const normQuery = guestSearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                            const matches = guestsList.filter(g => {
                              const gName = (g.name || g.firstname || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                              return gName.includes(normQuery);
                            });

                            if (matches.length === 0) {
                              return (
                                <li className="rsvp-dropdown-empty">
                                  Nenhum convite encontrado com "{guestSearchQuery}".
                                </li>
                              );
                            }

                            return matches.map(g => (
                              <li
                                key={g.id}
                                className="rsvp-dropdown-item"
                                onClick={() => {
                                  setSelectedGuest(g);
                                  setGuestSearchQuery(g.name || g.firstname || '');
                                  setIsSearchDropdownOpen(false);
                                  if (g.confirmed_presence) {
                                    setHasAbsentees(g.has_absentees ?? false);
                                    setAbsentNames(g.absent_names || '');
                                  } else {
                                    setHasAbsentees(null);
                                    setAbsentNames('');
                                  }
                                  if (g.phone) setRsvpPhone(g.phone);
                                  if (g.message) setRsvpMessage(g.message);
                                }}
                              >
                                <span><strong>{g.name || g.firstname}</strong></span>
                                {g.confirmed_presence ? (
                                  <span className="badge-all-present" style={{ fontSize: '11px' }}>
                                    <Check size={12} style={{ display: 'inline', marginRight: '3px' }} />
                                    Já confirmado
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--gold-dark)' }}>Selecionar</span>
                                )}
                              </li>
                            ));
                          })()}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="rsvp-selected-card">
                      <div className="rsvp-selected-info">
                        <span className="rsvp-selected-label">Convite Selecionado</span>
                        <span className="rsvp-selected-name">{selectedGuest.name || selectedGuest.firstname}</span>
                        {selectedGuest.confirmed_presence && (
                          <div className="rsvp-already-confirmed-alert">
                            ✨ Este convite já foi confirmado anteriormente! Você pode atualizar as informações abaixo e confirmar novamente se desejar.
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="rsvp-btn-change"
                        onClick={() => {
                          setSelectedGuest(null);
                          setGuestSearchQuery('');
                          setIsSearchDropdownOpen(false);
                        }}
                      >
                        Trocar nome
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Pergunta obrigatória de comparecimento */}
                {selectedGuest && (
                  <>
                    <div className="form-group" style={{ marginTop: '20px' }}>
                      <label className="form-label">Alguém não poderá comparecer?</label>
                      <div className="rsvp-options-grid">
                        <button
                          type="button"
                          className={`rsvp-option-card ${hasAbsentees === false ? 'active' : ''}`}
                          onClick={() => {
                            setHasAbsentees(false);
                            setAbsentNames('');
                          }}
                        >
                          <UserCheck size={20} color={hasAbsentees === false ? 'var(--gold-primary)' : 'var(--text-muted)'} />
                          <span>Todos irão comparecer</span>
                        </button>

                        <button
                          type="button"
                          className={`rsvp-option-card ${hasAbsentees === true ? 'active' : ''}`}
                          onClick={() => setHasAbsentees(true)}
                        >
                          <UserX size={20} color={hasAbsentees === true ? '#B23B37' : 'var(--text-muted)'} />
                          <span>Sim (alguém não poderá)</span>
                        </button>
                      </div>

                      {hasAbsentees === true && (
                        <div className="rsvp-absent-input-box">
                          <label className="form-label" style={{ color: '#B23B37' }}>
                            Nome de quem NÃO vai comparecer:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nome de quem não poderá comparecer"
                            className="form-input"
                            value={absentNames}
                            onChange={(e) => setAbsentNames(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Telefone de Contato (WhatsApp - Opcional)</label>
                      <input
                        type="tel"
                        placeholder="(84) 99999-9999"
                        className="form-input"
                        value={rsvpPhone}
                        onChange={(e) => setRsvpPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Deixe uma mensagem para os noivos (Opcional)</label>
                      <textarea
                        rows={3}
                        placeholder="Deseje felicidades aos noivos..."
                        className="form-input"
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={rsvpSubmitting || hasAbsentees === null || (hasAbsentees === true && !absentNames.trim())}
                      className="btn-submit"
                    >
                      {rsvpSubmitting ? 'Confirmando...' : 'Confirmar Presença'}
                    </button>
                  </>
                )}
              </form>
            ) : (
              <div className="success-card">
                <div className="success-icon">
                  <Heart size={64} fill="var(--accent-rose)" color="var(--gold-primary)" />
                </div>
                <h3 className="success-title">Obrigado pela confirmação!</h3>
                <p className="success-text" style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '10px' }}>
                  {hasAbsentees ? (
                    <>
                      Registramos com carinho a presença do convite <strong>{lastConfirmedGuestName}</strong>.<br />
                      Ficamos cientes de que <em>{absentNames}</em> não poderá comparecer. Agradecemos imensamente a resposta e o carinho!
                    </>
                  ) : (
                    <>
                      Confirmamos a presença de todos de <strong>{lastConfirmedGuestName}</strong>!<br />
                      Ficamos imensamente felizes em saber que vocês celebrarão esse grande dia conosco!
                    </>
                  )}
                </p>
                <button
                  onClick={() => {
                    setRsvpSubmitted(false);
                    setSelectedGuest(null);
                    setGuestSearchQuery('');
                    setHasAbsentees(null);
                    setAbsentNames('');
                    setRsvpPhone('');
                    setRsvpMessage('');
                  }}
                  className="btn-reset"
                  style={{ marginTop: '20px' }}
                >
                  Fazer outra confirmação ou atualizar
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Gifts Grid Section */}
        <section id="presentes" className="section section-alt">
          <div className="section-content">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <img src="/2.png" alt="Ornamento" style={{ height: '50px', objectFit: 'contain', opacity: 0.8 }} />
            </div>
            <h2 className="section-title">Lista de Presentes</h2>
            <p className="section-subtitle">Nossa lista de casamento e cotas de lua de mel</p>

            <p style={{ maxWidth: '700px', margin: '0 auto 40px', fontSize: '15px', color: 'var(--text-muted)' }}>
              Criamos uma lista de presentes virtuais para os nossos convidados nos abençoarem nesta nova etapa.
              Você pode escolher presentear de forma direta via PIX ou comprar o item físico em uma loja externa de sua preferência.
            </p>

            {/* Pix de Qualquer Valor Banner */}
            <div className="custom-contribution-banner" style={{
              background: 'linear-gradient(135deg, rgba(230, 204, 178, 0.25) 0%, rgba(245, 235, 224, 0.4) 100%)',
              border: '1px solid var(--gold-primary)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto 35px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Heart size={28} color="var(--gold-primary)" fill="var(--gold-light)" style={{ opacity: 0.8 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-dark)', margin: 0 }}>
                Presentear com outro valor
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, maxWidth: '450px' }}>
                Se você deseja nos abençoar com qualquer outro valor de sua preferência via PIX, clique no botão abaixo.
              </p>
              <button
                onClick={() => {
                  setSelectedGift({
                    id: 0,
                    name: 'Contribuição Livre',
                    description: 'Contribuição com qualquer valor via PIX.',
                    price: 0,
                    image_url: '/Lista-presentes/operacao_lua_de_mel.png',
                    status: 'available'
                  });
                  setModalTab('pix');
                  setCustomAmount('1');
                }}
                className="btn-gift"
                style={{ padding: '10px 24px', marginTop: '4px' }}
              >
                Contribuir com qualquer valor
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="gift-filters">
              <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>Todos</button>
              <button onClick={() => setFilter('low')} className={`filter-btn ${filter === 'low' ? 'active' : ''}`}>Até R$ 200</button>
              <button onClick={() => setFilter('mid')} className={`filter-btn ${filter === 'mid' ? 'active' : ''}`}>R$ 200 - R$ 500</button>
              <button onClick={() => setFilter('high')} className={`filter-btn ${filter === 'high' ? 'active' : ''}`}>Acima de R$ 500</button>
            </div>

            {/* Gifts Cards Grid */}
            <div className="gifts-grid">
              {filteredGifts.map(gift => (
                <div key={gift.id} className="gift-card">
                  <div className="gift-img-container">
                    <img src={gift.image_url} alt={gift.name} className="gift-img" />
                    <span className={`gift-badge badge-${gift.status}`}>
                      {gift.status === 'available' ? 'Disponível' : gift.status === 'claimed' ? 'Reservado' : 'Entregue'}
                    </span>
                  </div>
                  <div className="gift-body">
                    <h3 className="gift-title">{gift.name}</h3>
                    <p className="gift-desc">{gift.description}</p>
                    <div className="gift-price-row">
                      <span className="gift-price">{formatBRL(gift.price)}</span>
                      {gift.status === 'available' ? (
                        <button
                          onClick={() => {
                            setSelectedGift(gift);
                            setModalTab('pix');
                          }}
                          className="btn-gift"
                        >
                          Presentear
                        </button>
                      ) : (
                        <button className="btn-gift btn-gift-disabled" disabled>
                          {gift.status === 'claimed' ? 'Reservado' : 'Já recebido'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Gift Detail / Checkout Modal */}
      {selectedGift && (
        <div className="modal-overlay" onClick={() => setSelectedGift(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedGift(null)}>×</button>

            <div className="modal-header">
              <h3 className="modal-title">{selectedGift.name}</h3>
              <p className="modal-subtitle">
                Valor do presente: {selectedGift.id === 0 ? formatBRL(customAmount) : formatBRL(selectedGift.price)}
              </p>
            </div>

            {selectedGift.id !== 0 && (
              <div className="modal-tabs">
                <button
                  onClick={() => setModalTab('pix')}
                  className={`modal-tab ${modalTab === 'pix' ? 'active' : ''}`}
                >
                  Presentear via PIX
                </button>
                <button
                  onClick={() => setModalTab('external')}
                  className={`modal-tab ${modalTab === 'external' ? 'active' : ''}`}
                >
                  Comprar em Loja Externa
                </button>
              </div>
            )}

            <div className="modal-body">
              {modalTab === 'pix' ? (
                /* Tab Pix Content */
                <div className="pix-instructions">
                  <form onSubmit={handleClaimGift} style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-dark)' }}>
                      Por favor, preencha seus dados abaixo para podermos identificar seu presente e reservar o item em seu nome:
                    </p>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label">Seu Nome Completo</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Ex: Lucas Silva"
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">Seu Telefone</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        placeholder="(84) 99999-9999"
                        value={buyerPhone}
                        onChange={e => setBuyerPhone(e.target.value)}
                      />
                    </div>

                    {selectedGift.id === 0 && (
                      <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                          Valor da Contribuição (R$)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Digite o valor desejado"
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                        />
                        {(parseFloat(customAmount) < 1 || !customAmount || isNaN(parseFloat(customAmount))) && (
                          <span style={{ color: '#d9534f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                            O valor mínimo de contribuição é R$ 1,00.
                          </span>
                        )}
                      </div>
                    )}

                    {selectedGift.id === 0 && (parseFloat(customAmount) < 1 || !customAmount || isNaN(parseFloat(customAmount))) ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', border: '1px dashed #d9534f', borderRadius: '8px', color: '#d9534f', background: 'rgba(217, 83, 79, 0.02)', marginBottom: '15px' }}>
                        Aguardando um valor válido (mínimo de R$ 1,00) para gerar as instruções de pagamento.
                      </div>
                    ) : (
                      <div style={{ borderTop: '1px solid var(--gold-light)', paddingTop: '20px', marginTop: '20px' }}>
                        <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                          Escaneie o QR code abaixo ou copie o código Pix "Copia e Cola" para efetuar o pagamento do valor correspondente na conta do noivo.
                        </p>

                        <div className="pix-qr-container" style={{ margin: '20px auto', display: 'flex', justifyContent: 'center' }}>
                          {/* Simulated elegant QR code visual */}
                          <div style={{
                            width: '160px',
                            height: '160px',
                            background: 'white',
                            border: '6px solid var(--gold-light)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                generatePixCode({
                                  key: PIX_KEY,
                                  name: PIX_NAME,
                                  city: PIX_CITY,
                                  amount: selectedGift.id === 0 ? customAmount : (typeof selectedGift.price === 'number' ? selectedGift.price : parseFloat(selectedGift.price)),
                                  description: buyerName ? buyerName : selectedGift.name
                                })
                              )}`}
                              alt="PIX QR Code"
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        </div>

                        <div className="pix-code-box">
                          {generatePixCode({
                            key: PIX_KEY,
                            name: PIX_NAME,
                            city: PIX_CITY,
                            amount: selectedGift.id === 0 ? customAmount : (typeof selectedGift.price === 'number' ? selectedGift.price : parseFloat(selectedGift.price)),
                            description: buyerName ? buyerName : selectedGift.name
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText(
                            generatePixCode({
                              key: PIX_KEY,
                              name: PIX_NAME,
                              city: PIX_CITY,
                              amount: selectedGift.id === 0 ? customAmount : (typeof selectedGift.price === 'number' ? selectedGift.price : parseFloat(selectedGift.price)),
                              description: buyerName ? buyerName : selectedGift.name
                            }),
                            'Código PIX Copia e Cola'
                          )}
                          className="btn-copy"
                        >
                          <Copy size={16} /> Copiar Código Pix
                        </button>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--gold-light)', paddingTop: '20px', marginTop: '20px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        Importante: Após concluir a transferência no aplicativo do seu banco, clique no botão abaixo para registrar e confirmar a reserva do presente.
                      </p>
                      <button type="submit" disabled={claimSubmitting} className="btn-submit">
                        {claimSubmitting ? 'Confirmando...' : 'Confirmar Envio do Pix'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Tab External Purchase Content */
                <div className="external-purchase-info">
                  <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                    Caso prefira comprar este item em uma loja física ou online de sua escolha (como Magazine Luiza, Amazon, Casas Bahia, etc.), por favor solicite a entrega no nosso endereço abaixo:
                  </p>

                  <div className="address-box">
                    <div className="address-title">Endereço de Entrega dos Noivos</div>
                    <p className="address-text">
                      {DELIVERY_ADDRESS}
                    </p>
                  </div>

                  <button
                    onClick={() => copyText(DELIVERY_ADDRESS, 'Endereço de entrega')}
                    className="btn-copy"
                    style={{ margin: '0 auto 25px', display: 'flex' }}
                  >
                    <Copy size={16} /> Copiar Endereço Completo
                  </button>

                  {/* Claim Form */}
                  <form onSubmit={handleClaimGift} style={{ borderTop: '1px solid var(--gold-light)', paddingTop: '20px', textAlign: 'left' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                      Preencha seus dados abaixo para marcar este item como comprado e removê-lo da lista de disponíveis para outros convidados.
                    </p>
                    <div className="form-group">
                      <label className="form-label">Seu Nome Completo</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Ex: Lucas Silva"
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Seu Telefone</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        placeholder="(84) 99999-9999"
                        value={buyerPhone}
                        onChange={e => setBuyerPhone(e.target.value)}
                      />
                    </div>
                    <button type="submit" disabled={claimSubmitting} className="btn-submit">
                      {claimSubmitting ? 'Marcando como Comprado...' : 'Marcar Presente como Comprado'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <Check size={18} color="var(--accent-olive)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <img src="/J.png" alt="Monograma" style={{ height: '100px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div className="footer-names">Jacieli & Lucas</div>
        <p className="footer-text">Com carinho, esperamos por você em nosso grande dia.</p>

        <button
          onClick={() => setIsAdminOpen(true)}
          className="btn-admin-footer"
          style={{
            marginTop: '15px',
            fontSize: '12px',
            color: 'var(--gold-primary)',
            opacity: 0.8,
            textDecoration: 'underline',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Lock size={12} /> Área dos Noivos
        </button>

        <p className="footer-text" style={{ marginTop: '15px', fontSize: '11px', opacity: 0.6 }}>
          © 2026 Jacieli & Lucas. Todos os direitos reservados.
        </p>
      </footer>

      {/* Admin Login Modal */}
      {isAdminOpen && (
        <div className="modal-overlay" onClick={() => setIsAdminOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => setIsAdminOpen(false)}>×</button>
            <div className="modal-header" style={{ textAlign: 'center' }}>
              <Lock size={28} color="var(--gold-primary)" style={{ marginBottom: '10px' }} />
              <h3>Área dos Noivos</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Faça login para gerenciar presentes e convidados</p>
            </div>

            <div className="modal-body">
              <form onSubmit={handleAdminLogin} className="admin-login-form">
                {adminError && (
                  <div style={{ color: '#d9534f', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>
                    {adminError}
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: '15px', textAlign: 'left' }}>
                  <label className="form-label">Usuário</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={adminUser}
                    onChange={e => setAdminUser(e.target.value)}
                    placeholder="Nome de usuário"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
                  <label className="form-label">Senha</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="btn-submit" style={{ width: '100%' }}>
                  Entrar no Painel
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
