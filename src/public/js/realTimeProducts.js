const socket = io();

socket.on("realtimeproducts", products => {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    
    if (Array.isArray(products)){
    products.forEach(product => {
        let formattedPrice = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS"
        }).format(product.price);

        let listItem = document.createElement("li");
        listItem.innerHTML = `${product.title} - ${formattedPrice} <button onclick="eliminarProducto('${product._id}')">Eliminar</button>`;
        productList.appendChild(listItem);
    });
} else {
    console.error("los productos recibidos no son una array:", products);
}
});

document.getElementById("product-form").addEventListener("submit", event => {
    event.preventDefault();

    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        code: document.getElementById("code").value,
        price: parseFloat(document.getElementById("price").value),
        status: true,
        stock: 10,
        category: document.getElementById("category").value,
        thumbnails: [document.getElementById("image").value]
    };

    socket.emit("nuevoProducto", product);
    event.target.reset();
});

function eliminarProducto(id) {
    socket.emit("eliminarProducto", id);
}