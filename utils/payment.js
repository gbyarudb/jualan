
const payment = {
    async generatePayment(webName) {
        return `https://qris.example.com/pay?web=${webName}`;
    }
};

export default payment;
