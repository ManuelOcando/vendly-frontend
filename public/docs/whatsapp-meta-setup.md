# Guía de Configuración WhatsApp Business API - Meta

## Requisitos previos

1. Cuenta de Meta Business: https://business.facebook.com
2. Cuenta de Meta for Developers: https://developers.facebook.com
3. Número de teléfono para WhatsApp Business (no personal)

## Paso 1: Crear App en Meta Developers

1. Ve a https://developers.facebook.com/apps
2. Click "Create App"
3. Selecciona "Business" como tipo de app
4. Completa la información básica

## Paso 2: Añadir Producto WhatsApp

1. En el dashboard de tu app, busca "Add Product"
2. Selecciona "WhatsApp"
3. Esto te dará acceso a la API

## Paso 3: Configurar Número de Teléfono

1. En el panel de WhatsApp, ve a "API Setup"
2. Verifica tu número de teléfono:
   - Puedes usar el número de prueba gratuito (envía mensajes a números pre-registrados)
   - O verificar tu propio número de WhatsApp Business
3. Copia el **Phone Number ID** (lo necesitarás en Vendly)

## Paso 4: Crear System User y Token

### Crear System User
1. Ve a Meta Business Suite → Configuración → Usuarios del sistema
2. Click "Añadir" → Crear usuario del sistema
3. Nombre: "Vendly Bot"
4. Rol: Admin (o con permisos específicos)

### Asignar Permisos
El System User necesita:
- `whatsapp_business_messaging` - Enviar mensajes
- `whatsapp_business_management` - Gestionar plantillas (opcional)

### Generar Access Token
1. En el usuario del sistema, click "Generar nuevo token"
2. Selecciona tu app
3. Selecciona los permisos de WhatsApp
4. **IMPORTANTE**: Activa "Token permanente" (esto evita que expire)
5. Copia el token (empieza con `EAAB...`)

## Paso 5: Configurar en Vendly

1. Ve al Dashboard de Vendly → Configuración → Bot de WhatsApp
2. Completa los campos:
   - **Phone Number ID**: El ID que copiaste del paso 3
   - **Access Token**: El token permanente del paso 4
   - **Business Account ID**: Opcional, solo para plantillas
   - **Número de WhatsApp**: Tu número completo (ej: 584123456789)
3. Click "Guardar Configuración"
4. Verifica que el estado muestre "Conectado"

## Paso 6: Configurar Webhook (para recibir mensajes)

Para que el bot responda automáticamente, configura el webhook:

1. En Meta Developers → Tu App → WhatsApp → Configuration
2. En "Webhooks", click "Edit"
3. Callback URL: `https://vendly-backend-uuos.onrender.com/webhook/whatsapp`
4. Verify Token: `vendly-webhook-secret`
5. Subscribe to events:
   - `messages` - Recibir mensajes entrantes
   - `message_statuses` - Confirmaciones de entrega

## Paso 7: Verificar Funcionamiento

1. Envía un mensaje de WhatsApp al número configurado
2. El bot debería responder automáticamente
3. Verifica en el Dashboard que el mensaje aparece en "Logs"

## Costos y Límites

### Tier Gratuito
- **1000 conversaciones/mes** gratis
- Una conversación = 24 horas de mensajes con un usuario
- Sin límite de mensajes dentro de la ventana de 24h

### Después del límite gratuito
- Conversaciones iniciadas por usuario: ~$0.005-0.08 USD
- Conversaciones iniciadas por negocio (usando plantilla): ~$0.08-0.20 USD
- Varía según país

### Límites de rate
- 80 mensajes/segundo por número de teléfono
- Suficiente para la mayoría de casos de uso

## Solución de Problemas

### "Credenciales inválidas"
- Verifica que el token no haya expirado
- Asegúrate de que el System User tiene los permisos correctos
- El Phone Number ID debe ser correcto

### "No se reciben mensajes"
- Verifica que el webhook está configurado correctamente
- Asegúrate de que el callback URL es accesible públicamente
- Verifica los logs del backend

### "El bot no responde"
- Verifica que el número de teléfono está verificado en Meta
- Asegúrate de que hay créditos disponibles (1000 gratis/mes)
- Revisa los logs del bot en el backend

## Recursos útiles

- [Documentación oficial Meta](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Dashboard de Meta Business](https://business.facebook.com)
- [Meta for Developers](https://developers.facebook.com)

## Notas importantes

1. **No uses tu WhatsApp personal**: Debe ser un número de WhatsApp Business
2. **El token es sensible**: Guárdalo seguro, no lo compartas
3. **Verificación requerida**: Meta puede pedir verificación de tu negocio para ciertas funciones
4. **Plantillas**: Para iniciar conversaciones, necesitas plantillas aprobadas por Meta
