
const vercel = {
    async deploySite(siteName, userData) {
        console.log(`Deploy web ${siteName}.bosku.com untuk user ${userData.userId} (dummy).`);
        return true;
    }
};

export default vercel;
