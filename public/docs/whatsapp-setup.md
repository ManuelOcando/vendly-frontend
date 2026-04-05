# Guía de Configuración WhatsApp Bot - Vendly

## Requisitos previos
1. Cuenta Railway (gratis): https://railway.app
2. Número de WhatsApp disponible

## Pasos para configurar tu bot

### 1. Crear cuenta en Railway
- Ve a https://railway.app y regístrate con GitHub

### 2. Fork de Evolution API
- Fork: https://github.com/EvolutionAPI/evolution-api

### 3. Deploy en Railway
- New Project → Deploy from GitHub
- Selecciona tu fork de evolution-api

### 4. Variables de entorno
```
NODE_ENV=production
SERVER_URL=https://[tu-proyecto].up.railway.app
AUTHENTICATION_API_KEY=tu-api-key-segura
DATABASE_URL=sqlite:///data/evolution.db
WEBHOOK_GLOBAL_URL=https://vendly-backend-uuos.onrender.com/webhook/whatsapp
WEBHOOK_GLOBAL_ENABLED=true
```

### 5. Volumen persistente
- Volumes → evolution-data
- Mount: /data
- Size: 1GB

### 6. Configurar en Vendly Dashboard
- URL del Bot: tu URL de Railway
- API Key: la misma del paso 4
- Instance Name: vendly-bot

### 7. Escanear QR
- Ve a tu URL + /manager
- Escanea QR con WhatsApp Business

## Límites Railway Free
- 500 horas/mes = ~16 horas/día
- Recomendado: activar solo en horario comercial
