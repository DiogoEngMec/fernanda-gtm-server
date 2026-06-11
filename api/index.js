const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
const GOOGLE_ADS_CONVERSION_ID = 'AW-16469027355';
const GOOGLE_ADS_CLICK_CONVERSION = 'Hr4-CPr-rvMZEJvUhaO9';
const GOOGLE_ADS_FORM_CONVERSION = 'KgyZCNmapLwcEJvUha09';

// Middleware
app.use(cors());
app.use(express.json());

// Logger
const log = (message, data = '') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para conversão de cliques WhatsApp
app.post('/conversion/click', async (req, res) => {
  try {
    const { gclid, conversionValue, currency } = req.body;
    
    log('Click conversion received:', { gclid, conversionValue });

    // Construir payload para Google Ads
    const conversionPayload = {
      conversionValue: conversionValue || 0,
      conversionCurrencyCode: currency || 'BRL',
      gclid: gclid,
    };

    // Log da conversão (em produção, enviar para Google Ads)
    log('Click conversion processed:', conversionPayload);

    res.status(200).json({
      success: true,
      message: 'Click conversion recorded',
      conversionId: GOOGLE_ADS_CLICK_CONVERSION,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log('Error processing click conversion:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para conversão de formulários
app.post('/conversion/form', async (req, res) => {
  try {
    const { gclid, formData, email } = req.body;

    log('Form conversion received:', { gclid, email });

    // Construir payload para Google Ads
    const conversionPayload = {
      conversionValue: 1,
      conversionCurrencyCode: 'BRL',
      gclid: gclid,
      userIdentifiers: email ? [{
        hashedEmail: hashEmail(email),
      }] : [],
    };

    // Log da conversão (em produção, enviar para Google Ads)
    log('Form conversion processed:', conversionPayload);

    res.status(200).json({
      success: true,
      message: 'Form conversion recorded',
      conversionId: GOOGLE_ADS_FORM_CONVERSION,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log('Error processing form conversion:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para rastreamento de eventos (compatível com GTM)
app.post('/track', async (req, res) => {
  try {
    const { eventName, conversionData } = req.body;

    log('Event tracked:', { eventName });

    if (eventName === 'click_whatsapp') {
      // Processar clique WhatsApp
      log('Processing WhatsApp click');
    } else if (eventName === 'form_submission') {
      // Processar submissão de formulário
      log('Processing form submission');
    }

    res.status(200).json({
      success: true,
      message: 'Event tracked',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log('Error tracking event:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint raiz (para verificar se servidor está rodando)
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Fernanda GTM Server-Side',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      clickConversion: '/conversion/click',
      formConversion: '/conversion/form',
      trackEvent: '/track',
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err, req, res, next) => {
  log('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Função auxiliar para hash de email
function hashEmail(email) {
  // Em produção, usar SHA-256
  return Buffer.from(email.toLowerCase().trim()).toString('base64');
}

// Iniciar servidor
app.listen(PORT, () => {
  log(`GTM Server rodando na porta ${PORT}`);
  log(`Ambiente: ${process.env.ENVIRONMENT || 'development'}`);
  log(`Google Ads ID: ${GOOGLE_ADS_CONVERSION_ID}`);
});

module.exports = app;
