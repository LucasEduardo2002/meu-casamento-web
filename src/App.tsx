import React, { useState, useEffect } from 'react';
import {
  Heart,
  MapPin,
  Calendar,
  Clock,
  Copy,
  Check,
  Navigation,
  Wine
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
}

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

  // RSVP Form States
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpLastName, setRsvpLastName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpConfirmed, setRsvpConfirmed] = useState(true);
  const [rsvpGuestCount, setRsvpGuestCount] = useState(1);
  const [rsvpCompanions, setRsvpCompanions] = useState('');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Gifts List States
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [modalTab, setModalTab] = useState<'pix' | 'external'>('pix');

  // Claim Form States
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        const data = await response.json();
        setGifts(data);
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
          price: 480.00,
          image_url: 'https://images.unsplash.com/photo-1584990347163-2b86b71390d6?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 2.00,
          name: 'Aparelho de Jantar Completo',
          description: 'Conjunto de pratos para refeições.',
          price: 350.00,
          image_url: 'https://images.unsplash.com/photo-1591632288574-a387f820a1ca?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 3.00,
          name: 'Airfryer',
          description: 'Fritadeira elétrica para preparar alimentos com rapidez.',
          price: 400.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1711051351678-658b273f71d4?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 4.00,
          name: 'Liquidificador ou Processador de Alimentos',
          description: 'Para preparar sucos, vitaminas e receitas.',
          price: 100.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1718043036199-d98bef36af46?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 5.00,
          name: 'Conjunto de Taças',
          description: 'Taças de vidro para brindar momentos especiais.',
          price: 150.00,
          image_url: 'https://images.unsplash.com/photo-1574494349420-ecf8ccbff974?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 6.00,
          name: 'Faqueiro Inox',
          description: 'Conjunto de talheres em aço inox.',
          price: 80.00,
          image_url: 'https://images.unsplash.com/photo-1503197553955-b4eafae3e08e?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 7.00,
          name: 'Garrafa Térmica de Café',
          description: 'Garrafa térmica para café ou chá.',
          price: 60.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1752846974618-e14290df59c1?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 8.00,
          name: 'Batedeira Planetária',
          description: 'Batedeira para auxiliar no preparo de receitas.',
          price: 350.00,
          image_url: 'https://images.unsplash.com/photo-1595644258096-69155da290fd?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 9.00,
          name: 'Aspirador de Pó Vertical',
          description: 'Aspirador vertical para limpeza prática.',
          price: 170.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1661679038354-cc7279833968?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 10.00,
          name: 'Micro-ondas 220v',
          description: 'Micro-ondas para aquecer as refeições.',
          price: 580.00,
          image_url: 'https://images.unsplash.com/photo-1608384156808-418b5c079968?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 11.00,
          name: 'Sanduicheira',
          description: 'Sanduicheira para fazer lanches.',
          price: 80.00,
          image_url: 'https://images.unsplash.com/photo-1588869712605-dfcd7f24e652?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 12.00,
          name: 'Gelagua ou Bebedouro',
          description: 'Gelagua para termos água gelada sempre à disposição.',
          price: 450.00,
          image_url: '/src/assets/gelagua.png',
          status: 'available',
        },
        {
          id: 13.00,
          name: 'Ventilador de Coluna',
          description: 'Ventilador para os dias quentes.',
          price: 180.00,
          image_url: 'https://images.unsplash.com/photo-1559719740-f4d59cf117cb?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 14.00,
          name: 'Conjunto de Copos',
          description: 'Copos de vidro para uso diário.',
          price: 80.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1670426502195-6544f2debf1b?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 15.00,
          name: 'Jogo de Assadeiras e Travessas',
          description: 'Travessas de vidro para assar e servir.',
          price: 180.00,
          image_url: 'https://images.unsplash.com/photo-1720421920272-456e78a75e2e?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 16.00,
          name: 'Conjunto de Potes para Mantimentos',
          description: 'Conjunto de potes organizadores.',
          price: 120.00,
          image_url: 'https://images.unsplash.com/photo-1621318551436-68573392fd5c?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 17.00,
          name: 'Kit de Utensílios de Silicone',
          description: 'Utensílios de silicone para cozinha.',
          price: 95.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1776720097326-9cf81f1560c5?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 18.00,
          name: 'Tábua de Corte de Bambu',
          description: 'Tábua de corte em bambu.',
          price: 70.00,
          image_url: 'https://images.unsplash.com/photo-1617695615794-a5abcece0f48?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 19.00,
          name: 'Kit para Churrasco',
          description: 'Faca, garfo e pegador para churrasco.',
          price: 160.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1693221705527-d46b2477f5cd?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 20.00,
          name: 'Secador de Louça',
          description: 'Escorredor de louças para a cozinha.',
          price: 110.00,
          image_url: 'https://images.unsplash.com/photo-1601599561263-591607ab1606?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 21.00,
          name: 'Boleira de Vidro',
          description: 'Boleira com tampa de vidro.',
          price: 90.00,
          image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 22.00,
          name: 'Conjunto de Talheres de Sobremesa',
          description: 'Talheres pequenos para servir sobremesas.',
          price: 60.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1666739031577-1edb0ca25a60?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 23.00,
          name: 'Jogo de Lençol de Algodão Queen',
          description: 'Jogo de lençol queen de algodão.',
          price: 250.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1670869816769-c64fbc7b9c4c?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 24.00,
          name: 'Edredom Queen Cobre-Leito',
          description: 'Edredom queen confortável.',
          price: 320.00,
          image_url: 'https://images.unsplash.com/photo-1686827986080-8ee55b055a2f?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 25.00,
          name: 'Kit de Travesseiros Confort',
          description: 'Travesseiros para o quarto.',
          price: 120.00,
          image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 26.00,
          name: 'Protetor de Colchão Impermeável',
          description: 'Protetor impermeável para colchão queen.',
          price: 110.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1664015821142-32f429a6608f?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 27.00,
          name: 'Jogo de Toalhas de Banho',
          description: 'Jogo de toalhas de banho.',
          price: 180.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1684445034670-b36aca25c25a?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 28.00,
          name: 'Toalhas de Mesa e Jogo Americano',
          description: 'Toalha de mesa e jogo americano.',
          price: 120.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1670869816769-c64fbc7b9c4c?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 29.00,
          name: 'Conjunto de Panos de Prato',
          description: 'Panos de prato para cozinha.',
          price: 50.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1750041545838-f2ef7b41599a?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 30.00,
          name: 'Lixeira de Inox (Cozinha/Banheiro)',
          description: 'Lixeira de inox com pedal.',
          price: 90.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1664189121552-f6d1dbf2a45c?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 31.00,
          name: 'Porta-sabonete Líquido e Porta-escovas',
          description: 'Porta-sabonete líquido e porta-escovas para banheiro.',
          price: 75.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1679064286720-9f28c0f012d8?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 32.00,
          name: 'Tábua de Passar Roupa',
          description: 'Tábua de passar roupa.',
          price: 130.00,
          image_url: 'https://images.unsplash.com/photo-1540544093-b0880061e1a5?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 33.00,
          name: 'Fruteira de Mesa',
          description: 'Fruteira para mesa.',
          price: 110.00,
          image_url: 'https://images.unsplash.com/photo-1605280179505-db8b72e318b7?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 34.00,
          name: 'Manta Decorativa para Sofá',
          description: 'Manta decorativa para sofá.',
          price: 95.00,
          image_url: 'https://plus.unsplash.com/premium_photo-1678375722586-b5eef2972f4f?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 35.00,
          name: 'Mesa de Centro de Sala',
          description: 'Mesa de centro para sala.',
          price: 250.00,
          image_url: 'https://images.unsplash.com/photo-1724582586580-8b52c02e99dd?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        },
        {
          id: 36.00,
          name: 'Sapateira Organizadora',
          description: 'Sapateira organizadora.',
          price: 130.00,
          image_url: 'https://images.unsplash.com/photo-1478887011962-709960f8ced8?q=80&w=300&auto=format&fit=crop',
          status: 'available',
        }
      ]);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

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
    setRsvpSubmitting(true);

    const rsvpPayload = {
      firstname: rsvpName,
      lastname: rsvpLastName,
      confirmed_presence: rsvpConfirmed,
      email: rsvpEmail || null,
      phone: rsvpPhone || null,
      guest_count: rsvpConfirmed ? rsvpGuestCount : 0,
      companion_names: rsvpConfirmed ? rsvpCompanions : null,
      message: rsvpMessage || null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users-module`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rsvpPayload)
      });

      if (response.ok) {
        setRsvpSubmitted(true);
        showToast('Presença confirmada com sucesso!');
      } else {
        throw new Error('Erro na resposta do servidor.');
      }
    } catch (error) {
      console.error(error);
      // Even if API fails, simulate success visually for client-side demo
      setRsvpSubmitted(true);
      showToast('RSVP registrado localmente (API indisponível).');
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

  // Filter gifts by price
  const filteredGifts = gifts.filter(gift => {
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


  return (
    <>
      {/* Floating Navbar */}
      <nav className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/src/assets/J.png" alt="J & L Monograma" style={{ height: '48px', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600 }}>Jacieli & Lucas</span>
        </div>
        <div className="nav-links">
          <a href="#inicio" onClick={() => setActiveSection('inicio')} className={`nav-link ${activeSection === 'inicio' ? 'active' : ''}`}>Início</a>
          <a href="#detalhes" onClick={() => setActiveSection('detalhes')} className={`nav-link ${activeSection === 'detalhes' ? 'active' : ''}`}>Celebração</a>
          <a href="#historia" onClick={() => setActiveSection('historia')} className={`nav-link ${activeSection === 'historia' ? 'active' : ''}`}>Nossa História</a>
          <a href="#rsvp" onClick={() => setActiveSection('rsvp')} className={`nav-link ${activeSection === 'rsvp' ? 'active' : ''}`}>RSVP</a>
          <a href="#presentes" onClick={() => setActiveSection('presentes')} className={`nav-link ${activeSection === 'presentes' ? 'active' : ''}`}>Lista de Presentes</a>
        </div>
      </nav>

      <div className="fade-in">

        {/* Hero Section */}
        <section id="inicio" className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <div style={{ marginBottom: '15px' }}>
                <img src="/src/assets/J.png" alt="Monograma" style={{ height: '130px', objectFit: 'contain' }} />
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
                src="/src/assets/couple_church.jpg"
                alt="Jacieli e Lucas"
                className="hero-img"
                onError={(e) => {
                  // fallback image
                  (e.target as HTMLImageElement).src = "/src/assets/1.png";
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
                A cerimônia será realizada na Matriz de Nossa Senhora de Lourdes, na cidade de Campo Redondo/RN. Esperamos você para testemunhar os nossos votos de amor eterno.
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
                href="https://www.google.com/maps/search/?api=1&query=Ch%C3%A1cara+Por+do+Sol+s%C3%ADtio+Ramal+RN"
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
              <img src="/src/assets/2.png" alt="Ornamento" style={{ height: '50px', objectFit: 'contain', opacity: 0.8 }} />
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
            <img src="/src/assets/2.png" alt="Ornamento" style={{ height: '50px', objectFit: 'contain', opacity: 0.8 }} />
          </div>
          <h2 className="section-title">Confirmação de Presença</h2>
          <p className="section-subtitle">Por favor, confirme sua presença até 15 de Dezembro de 2026</p>

          <div className="rsvp-container">
            {!rsvpSubmitted ? (
              <form onSubmit={handleRsvpSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lucas"
                      className="form-input"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sobrenome</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Medeiros"
                      className="form-input"
                      value={rsvpLastName}
                      onChange={(e) => setRsvpLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    className="form-input"
                    value={rsvpEmail}
                    onChange={(e) => setRsvpEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone de Contato</label>
                  <input
                    type="tel"
                    placeholder="(84) 99999-9999"
                    className="form-input"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Você comparecerá?</label>
                  <div className="form-radio-group">
                    <label className="form-radio-label">
                      <input
                        type="radio"
                        name="confirmed"
                        className="form-radio-input"
                        checked={rsvpConfirmed === true}
                        onChange={() => setRsvpConfirmed(true)}
                      />
                      Sim, irei comparecer!
                    </label>
                    <label className="form-radio-label">
                      <input
                        type="radio"
                        name="confirmed"
                        className="form-radio-input"
                        checked={rsvpConfirmed === false}
                        onChange={() => setRsvpConfirmed(false)}
                      />
                      Não poderei comparecer.
                    </label>
                  </div>
                </div>

                {rsvpConfirmed && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Quantidade de Acompanhantes (incluindo você)</label>
                      <select
                        className="form-input"
                        value={rsvpGuestCount}
                        onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                      >
                        <option value={1}>1 pessoa</option>
                        <option value={2}>2 pessoas</option>
                        <option value={3}>3 pessoas</option>
                        <option value={4}>4 pessoas</option>
                        <option value={5}>5 pessoas</option>
                      </select>
                    </div>

                    {rsvpGuestCount > 1 && (
                      <div className="form-group">
                        <label className="form-label">Nome Completo dos Acompanhantes</label>
                        <textarea
                          rows={2}
                          placeholder="Nomes separados por vírgula"
                          className="form-input"
                          value={rsvpCompanions}
                          onChange={(e) => setRsvpCompanions(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

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

                <button type="submit" disabled={rsvpSubmitting} className="btn-submit">
                  {rsvpSubmitting ? 'Enviando...' : 'Confirmar Presença'}
                </button>
              </form>
            ) : (
              <div className="success-card">
                <div className="success-icon">
                  <Heart size={64} fill="var(--accent-rose)" color="var(--gold-primary)" />
                </div>
                <h3 className="success-title">Obrigado pela confirmação!</h3>
                <p className="success-text">
                  {rsvpConfirmed
                    ? 'Ficamos imensamente felizes em saber que você celebrará esse grande dia conosco.'
                    : 'Ficamos tristes por você não poder comparecer, mas agradecemos o carinho e a resposta.'
                  }
                </p>
                <button onClick={() => setRsvpSubmitted(false)} className="btn-reset">
                  Fazer outra confirmação ou atualizar dados
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Gifts Grid Section */}
        <section id="presentes" className="section section-alt">
          <div className="section-content">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <img src="/src/assets/2.png" alt="Ornamento" style={{ height: '50px', objectFit: 'contain', opacity: 0.8 }} />
            </div>
            <h2 className="section-title">Lista de Presentes</h2>
            <p className="section-subtitle">Nossa lista de casamento e cotas de lua de mel</p>

            <p style={{ maxWidth: '700px', margin: '0 auto 40px', fontSize: '15px', color: 'var(--text-muted)' }}>
              Criamos uma lista de presentes virtuais para os nossos convidados nos abençoarem nesta nova etapa.
              Você pode escolher presentear de forma direta via PIX ou comprar o item físico em uma loja externa de sua preferência.
            </p>

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
              <p className="modal-subtitle">Valor do presente: {formatBRL(selectedGift.price)}</p>
            </div>

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

            <div className="modal-body">
              {modalTab === 'pix' ? (
                /* Tab Pix Content */
                <div className="pix-instructions">
                  <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                    Escaneie o QR code abaixo ou copie o código Pix "Copia e Cola" para efetuar o pagamento do valor correspondente na conta do noivo.
                  </p>

                  <div className="pix-qr-container">
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
                            amount: selectedGift.price,
                            description: selectedGift.name.substring(0, 20)
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
                      amount: selectedGift.price,
                      description: selectedGift.name.substring(0, 20)
                    })}
                  </div>

                  <button
                    onClick={() => copyText(
                      generatePixCode({
                        key: PIX_KEY,
                        name: PIX_NAME,
                        city: PIX_CITY,
                        amount: selectedGift.price,
                        description: selectedGift.name.substring(0, 20)
                      }),
                      'Código PIX Copia e Cola'
                    )}
                    className="btn-copy"
                  >
                    <Copy size={16} /> Copiar Código Pix
                  </button>

                  {/* Claim Form */}
                  <form onSubmit={handleClaimGift} style={{ borderTop: '1px solid var(--gold-light)', paddingTop: '20px', textAlign: 'left' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                      Após realizar a transferência no app do seu banco, preencha seus dados para registrarmos a reserva deste item em nosso sistema.
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
                      {claimSubmitting ? 'Confirmando...' : 'Confirmar Envio do Pix'}
                    </button>
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
          <img src="/src/assets/J.png" alt="Monograma" style={{ height: '100px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div className="footer-names">Jacieli & Lucas</div>
        <p className="footer-text">Com carinho, esperamos por você em nosso grande dia.</p>
        <p className="footer-text" style={{ marginTop: '10px', fontSize: '11px', opacity: 0.6 }}>
          © 2026 Jacieli & Lucas. Todos os direitos reservados.
        </p>
      </footer>
    </>
  );
}

export default App;
