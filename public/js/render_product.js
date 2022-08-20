async function requestProducts(url) {
    try {
        removeProduct();
        const resAll = await axios.get(url);
        const products = resAll.data.data;

        let wrapper_dom = document.querySelector(".wrapper");

        // create a product-container dom
        let product_container_dom = document.createElement("div");
        product_container_dom.setAttribute("class", "product-container");

        for (let i = 0; i < products.length; i++) {
            let product = products[i]
            let pid = product.id;
            //create a product dom 
            let prod_dom = document.createElement("a");
            prod_dom.setAttribute("class", "product");
            //add a link
            prod_dom.setAttribute("href", `product.html?id=${pid}`);

            //insert product image
            let img_dom = document.createElement("img");
            img_dom.src = product.main_image;
            img_dom.setAttribute("class", "product-image");
            prod_dom.appendChild(img_dom);

            //color
            for (let j = 0; j < product.colors.length; j++) {
                let color_dom = document.createElement("p");
                color_dom.setAttribute("class", "color");
                color_dom.setAttribute("style", `background-color: #${product.colors[j].code}`);
                prod_dom.appendChild(color_dom);
            }

            //add name and price
            let name_dom = document.createElement("p");
            name_dom.setAttribute("class", "product-title");
            name_dom.textContent = product.title;
            prod_dom.appendChild(name_dom);

            //add  price
            let price_dom = document.createElement("p");
            price_dom.setAttribute("class", "product-price");
            price_dom.textContent = `NTD$${product.price}`;

            prod_dom.appendChild(price_dom);
            product_container_dom.appendChild(prod_dom);
        }

        // attach the product_container dom to body (wrapper)
        wrapper_dom.appendChild(product_container_dom)

    } catch (error) {
        console.error(error);
    }
}

function removeProduct() {
    try {
        let product_container_dom = document.querySelector(".product-container");
        if (product_container_dom) {
            product_container_dom.remove();
        }

    } catch (error) {
        console.error(error);
    }
}

function getSearchInput() {
    try {
        let search_input_dom = document.querySelector(".search-input");
        let keyword = search_input_dom.value
        console.log(keyword)
        return keyword
    } catch (error) {
        console.error(error);
    }
}

function searchProducts() {
    try {
        let keyword = getSearchInput();
        requestProducts(`api/1.0/products/search?keyword=${keyword}`)
    } catch (error) {
        console.error(error);
    }
}

function createImage(container_dom, main_image) {
    let img_div_dom = document.createElement("div");
    img_div_dom.setAttribute("class", "detail-main-image");
    let img_dom = document.createElement("img");
    img_dom.src = main_image;
    img_div_dom.appendChild(img_dom)
    container_dom.appendChild(img_div_dom);
}

function createTitleIdPrice(primary_info_dom, title, id, price) {

    //div for title, id, price
    let deatil_name_id_price = document.createElement("div");
    deatil_name_id_price.setAttribute("class", "detail-name-id-price");
    let detail_name = document.createElement("p");
    detail_name.setAttribute("class", "detail-name");
    detail_name.textContent = title;
    let detail_id = document.createElement("p");
    detail_id.setAttribute("class", "detail-id");
    detail_id.textContent = id;
    let detail_price = document.createElement("p");
    detail_price.setAttribute("class", "detail-price");
    detail_price.textContent = price;

    deatil_name_id_price.appendChild(detail_name);
    deatil_name_id_price.appendChild(detail_id);
    deatil_name_id_price.appendChild(detail_price);
    primary_info_dom.appendChild(deatil_name_id_price);

}

function createSelectColors(detail_color_size_quanity, colors) {

    let choose_color = document.createElement("div");
    choose_color.setAttribute("class", "detail-choose-color")
    let color_title = document.createElement("p");
    color_title.setAttribute("class", "detail-color-title")
    color_title.textContent = "顏色";
    choose_color.appendChild(color_title);
    let color_group = document.createElement("div");
    color_group.setAttribute("class", "detail-color-group")

    for (let j = 0; j < colors.length; j++) {
        let color_btn_wrap = document.createElement("div");
        color_btn_wrap.setAttribute("class", "detail-color-btn-wrap")
        let color_btn = document.createElement("button");
        color_btn.setAttribute("class", "detail-color-btn");
        color_btn.setAttribute("style", `background-color: #${colors[j].code}`);
        color_btn_wrap.appendChild(color_btn);
        color_group.appendChild(color_btn_wrap)
    }
    choose_color.appendChild(color_group);
    detail_color_size_quanity.appendChild(choose_color);
}

function createSelectSizes(detail_color_size_quanity, sizes) {

    let choose_size = document.createElement("div");
    choose_size.setAttribute("class", "detail-choose-size")
    let size_title = document.createElement("p");
    size_title.setAttribute("class", "detail-size-title")
    size_title.textContent = "尺寸";
    choose_size.appendChild(size_title);
    let size_group = document.createElement("div");
    size_group.setAttribute("class", "detail-size-group")

    for (let j = 0; j < sizes.length; j++) {
        let size_btn = document.createElement("button");
        size_btn.setAttribute("class", "detail-size-btn");
        size_btn.textContent = sizes[j]
        size_group.appendChild(size_btn)
    }

    choose_size.appendChild(size_group);
    detail_color_size_quanity.appendChild(choose_size);
}


function createSelectQuanity(detail_color_size_quanity) {
    let choose_quanity = document.createElement("div");
    choose_quanity.setAttribute("class", "detail-choose-quantity")
    let quanity_title = document.createElement("p");
    quanity_title.setAttribute("class", "detail-quantity-title")
    quanity_title.textContent = "數量";
    choose_quanity.appendChild(quanity_title);
    let quanity_group = document.createElement("div");
    quanity_group.setAttribute("class", "detail-quantity-group")

    let input_span = document.createElement("input");
    input_span.setAttribute("type", "number");
    quanity_group.appendChild(input_span);

    choose_quanity.appendChild(quanity_group);
    detail_color_size_quanity.appendChild(choose_quanity);
}

function createSelectColorsSizesQuantities(primary_info_dom, colors, sizes) {

    let detail_color_size_quanity = document.createElement("div");
    detail_color_size_quanity.setAttribute("class", "detail-color-size-quanity");

    createSelectColors(detail_color_size_quanity, colors)
    createSelectSizes(detail_color_size_quanity, sizes)
    createSelectQuanity(detail_color_size_quanity)

    primary_info_dom.appendChild(detail_color_size_quanity);

}

function createPrimaryInfo(product_container_dom, product) {
    const { colors, description, id, images, main_image,
        note, place, price, sizes, story, texture, title, variants, wash
    } = product;

    let primary_info_dom = document.createElement("div");
    primary_info_dom.setAttribute("class", "detail-primary");

    createTitleIdPrice(primary_info_dom, title, id, price)
    createSelectColorsSizesQuantities(primary_info_dom, colors, sizes)

    // TODO: more detail here

    product_container_dom.appendChild(primary_info_dom);

}


async function productDetail(pid) {
    try {
        const url = `api/1.0/products/details?id=${pid}`
        const products = await axios.get(url);
        const product = products.data.data;
        console.log(product)

        let banner_dom = document.querySelector(".banner");

        if (banner_dom) {
            banner_dom.remove();
        }

        let wrapper_dom = document.querySelector(".wrapper");

        // create a product-container dom
        let product_container_dom = document.createElement("div");
        product_container_dom.setAttribute("class", "detail-product-info");

        createImage(product_container_dom, product.main_image);
        createPrimaryInfo(product_container_dom, product)


        wrapper_dom.appendChild(product_container_dom)
    } catch (error) {
        console.error(error)
    }

}
