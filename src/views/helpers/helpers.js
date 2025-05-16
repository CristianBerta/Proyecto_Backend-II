export default {
    // Helper para multiplicar dos números
    multiply: function (a, b) {
        return a * b;
    },

    // Helper para comparar valores en condicionales
    eq: function (a, b) {
        return a === b;
    },

    // Helper para formatear precios
    formatPrice: function (price) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(price);
    },

    // Helpers para formatear fechas
    formatDate: function(date) {
        return new Date(date).toLocaleString();
    }
};