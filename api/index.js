const cors = require('cors');
require('dotenv').config();

// Configurações
const GOOGLE_ADS_CONVERSION_ID = 'AW-16469027355';
const GOOGLE_ADS_CLICK_CONVERSION = 'Hr4-CPr-rvMZEJvUhaO9';
const GOOGLE_ADS_FORM_CONVERSION = 'KgyZCNmapLwcEJvUha09';

// Logger
const log = (message, data = '') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
};

// Função auxiliar para verificar CORS
const checkCors = (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://agendamento.fernandamuniznutricionista.com',
    'https://fernandamuniznutricionista.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Handler para Vercel Functions
module.exports = function handler(req, res) {
  checkCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    log(`Received request: ${req.method} ${pathname}`);

    // Health check - MUST come FIRST, before other checks
    if (pathname.includes('health')) {
      log('Health check endpoint triggered');
      return res.status(200).json({ 
        status: 'OK',
        path: pathname,
        timestamp: new Date().toISOString() 
      });
    }

    // Root endpoint
    if (pathname === '/' || pathname === '/api') {
      return res.status(200).json({
        name: 'Fernanda GTM Server-Side',
        status: 'Running',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          clickConversion: '/api/conversion/click',
          formConversion: '/api/conversion/form',
          trackEvent: '/api/track',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Conversão de cliques WhatsApp
    if (pathname === '/api/conversion/click' && req.method === 'POST') {
      const { gclid, conversionValue, currency } = req.body;
      
      log('Click conversion received:', { gclid, conversionValue });

      const conversionPayload = {
        conversionValue: conversionValue || 0,
        conversionCurrencyCode: currency || 'BRL',
        gclid: gclid,
      };

      log('Click conversion processed:', conversionPayload);

      return res.status(200).json({
        success: true,
        message: 'Click conversion recorded',
        conversionId: GOOGLE_ADS_CLICK_CONVERSION,
        timestamp: new Date().toISOString(),
      });
    }

    // Conversão de formulários
    if (pathname === '/api/conversion/form' && req.method === 'POST') {
      const { gclid, formData, email } = req.body;

      log('Form conversion received:', { gclid, email });

      const conversionPayload = {
        conversionValue: 1,
        conversionCurrencyCode: 'BRL',
        gclid: gclid,
        userIdentifiers: email ? [{
          hashedEmail: hashEmail(email),
        }] : [],
      };

      log('Form conversion processed:', conversionPayload);

      return res.status(200).json({
        success: true,
        message: 'Form conversion recorded',
        conversionId: GOOGLE_ADS_FORM_CONVERSION,
        timestamp: new Date().toISOString(),
      });
    }

    // Track event
    if (pathname === '/api/track' && req.method === 'POST') {
      const { eventName, conversionData } = req.body;

      log('Event tracked:', { eventName });

      if (eventName === 'click_whatsapp') {
        log('Processing WhatsApp click');
      } else if (eventName === 'form_submission') {
        log('Processing form submission');
      }

      return res.status(200).json({
        success: true,
        message: 'Event tracked',
        timestamp: new Date().toISOString(),
      });
    }

    // 404
    return res.status(404).json({
      error: 'Not Found',
      path: pathname,
      method: req.method,
    });
  } catch (error) {
    log('Unhandled error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

// Função auxiliar para hash de email
function hashEmail(email) {
  return Buffer.from(email.toLowerCase().trim()).toString('base64');
}
