
const cloudflare = {
    async createSubdomain(siteName) {
        console.log(`Subdomain ${siteName}.bosku.com berhasil dibuat (dummy).`);
        return true;
    }
};

export default cloudflare;
