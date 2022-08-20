let product
function createImage(container_dom, product) {

    let main_image = product.main_image;
    let img_div_dom = document.createElement("div");
    img_div_dom.setAttribute("class", "detail-main-image");

    let img_dom = document.createElement("img");
    img_dom.src = main_image;
    img_div_dom.appendChild(img_dom)

    container_dom.appendChild(img_div_dom);
}

function createTitleIdPrice(primary_info_dom, title, id, price) {

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
    detail_price.textContent = `NTD$${price}`;

    deatil_name_id_price.appendChild(detail_name);
    deatil_name_id_price.appendChild(detail_id);
    deatil_name_id_price.appendChild(detail_price);

    primary_info_dom.appendChild(deatil_name_id_price);

}
let e_size
let e_color
function selectColor(e, variants, id) {
    console.log("e color: ", e.target.getAttribute("data-color"))
    let cur = document.getElementById(id);
    console.log(cur, cur.getAttribute("notinstock"))
    if (cur.getAttribute("notinstock") == "true") {
        return;
    }

    for (let i = 0; i < product.colors.length; i++) {

        let tag = "detail-color-btn-" + i;
        console.log("tag111: ", tag)
        if (id == tag) {
            document.getElementById("detail-color-btn-wrap-" + i).style.border = "1px solid gray";
        } else {
            document.getElementById("detail-color-btn-wrap-" + i).style.border = "none";
        }
        console.log("tag:", document.getElementById(tag))
    }

    e_color = e.target.getAttribute("data-color")
    let number = document.querySelector(".stock_box_input");
    number.value = 0

}

function createSelectColors(detail_color_size_quanity, colors, vairants) {

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
        color_btn_wrap.setAttribute("id", "detail-color-btn-wrap-" + j)
        let color_btn = document.createElement("button");
        color_btn.setAttribute("class", "detail-color-btn");
        color_btn.setAttribute("id", "detail-color-btn-" + j)
        color_btn.setAttribute("style", `background: #${colors[j].code}`);
        color_btn.setAttribute("data-color", `${colors[j].code}`);
        color_btn.onclick = (e) => { selectColor(e, vairants, color_btn.id) }
        if (j == 0) {
            color_btn_wrap.setAttribute("style", "border: 1px solid gray")
        }
        color_btn_wrap.appendChild(color_btn);
        color_group.appendChild(color_btn_wrap)

    }

    choose_color.appendChild(color_group);
    detail_color_size_quanity.appendChild(choose_color);
    // document.getElementById("detail-color-btn-wrap-0").style.border = "1px solid rgb(237, 250, 200)"
}

function selectSize(e, variants, id) {
    console.log("e size: ", e.target.getAttribute("data-size"))
    let cur = document.getElementById(id);
    console.log(cur, cur.notinstock)
    if (cur.notinstock == "true") {
        return;
    }

    for (let i = 0; i < product.sizes.length; i++) {
        let tag = "detail-size-btn-" + i;
        let t = document.getElementById("detail-size-btn-" + i);
        if (id == tag) {
            t.style.border = "1px solid gray";
        } else {
            t.style.border = "none";
        }
    }

    e_size = e.target.getAttribute("data-size")
    let number = document.querySelector(".stock_box_input");
    number.value = 0
}


//check stock
function check_stock() {
    let variants = product.variants
    console.log("choose_color", e_color)
    console.log("choose_size", e_size)
    console.log(variants)
    for (let i = 0; i < variants.length; i++) {
        if (variants[i].color_code === e_color && variants[i].size === e_size) {
            console.log("stock:", variants[i].stock)
            return variants[i].stock
        }
    }
    return 0;
}


// function updateColorBySizeSelection(variants, size) {
//     for (let i = 0; i < variants.length; i++) {
//         let v = variants[i];
//         if (v.size != size) {
//             let t = document.getElementById("detail-color-btn-" + i);
//             t.style.background = "gray";
//             t.setAttribute("notinstock", "true");
//         } else {
//             if (v.stock > 0) {
//                 let t = document.getElementById("detail-color-btn-" + i);
//                 t.style.background = `#${v.color_code}`;
//                 t.setAttribute("notinstock", "false");
//             } else {
//                 let t = document.getElementById("detail-color-btn-" + i);
//                 t.style.background = "gray";
//                 t.setAttribute("notinstock", "true");
//             }
//         }
//     }
// }

function createSelectSizes(detail_color_size_quanity, sizes, variants) {

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
        size_btn.setAttribute("id", "detail-size-btn-" + j)
        size_btn.setAttribute("data-size", `${sizes[j]}`);

        size_btn.textContent = sizes[j]
        size_btn.onclick = (e) => {
            selectSize(e, variants, size_btn.id);
        }
        if (j == 0) {
            size_btn.setAttribute("style", "border: 1px solid gray")
        }
        // if (j == 0) {
        //     size_btn.style.border = "1px solid rgb(237, 250, 200)"
        // }
        // document.getElementById("detail-size-btn-0").style.border = "1px solid rgb(237, 250, 200)"
        size_group.appendChild(size_btn)
    }
    choose_size.appendChild(size_group);

    detail_color_size_quanity.appendChild(choose_size);
}

function createSelectQuanity(detail_color_size_quanity, product, variants, stock, colors) {

    let choose_quanity = document.createElement("div");
    choose_quanity.setAttribute("class", "detail-choose-quantity")

    let quanity_title = document.createElement("p");
    quanity_title.setAttribute("class", "detail-quantity-title")
    quanity_title.textContent = "數量";
    choose_quanity.appendChild(quanity_title);

    let quanity_group = document.createElement("div");
    quanity_group.setAttribute("class", "detail-quantity-group")


    let stock_box = document.createElement("div")
    stock_box.setAttribute("class", "stock_box")
    let stock_minus = document.createElement('div')
    stock_minus.setAttribute("class", "stock_minus")
    stock_minus.textContent = "-"
    stock_minus.onclick = () => {
        let number = document.querySelector(".stock_box_input");

        if (+number.value === 0) {
            console.log("please select qty > 0");
            return
        }
        let newNumber = parseInt(number.value) - 1;
        number.value = newNumber;
    }

    let input_span = document.createElement("input");
    input_span.setAttribute("class", "stock_box_input")
    input_span.setAttribute("type", "number");
    input_span.setAttribute("min", "0");
    input_span.setAttribute("value", "0")
    input_span.setAttribute("disabled", "")

    let stock_plus = document.createElement('div')
    stock_plus.setAttribute("class", "stock_plus")

    stock_plus.textContent = "+"
    stock_plus.onclick = () => {
        let number = document.querySelector(".stock_box_input");

        if (+number.value === check_stock()) return

        let newNumber = parseInt(number.value) + 1;
        number.value = newNumber;

    }

    stock_box.appendChild(stock_minus)
    stock_box.appendChild(input_span)
    stock_box.appendChild(stock_plus)

    quanity_group.appendChild(stock_box);

    choose_quanity.appendChild(quanity_group);
    detail_color_size_quanity.appendChild(choose_quanity);
}

function createAddToChartBtn(detail_color_size_quanity) {

    let add_to_chart = document.createElement("div");
    add_to_chart.setAttribute("class", "detail-add-to-chart")

    let add_to_chart_btn = document.createElement("button");
    add_to_chart_btn.setAttribute("class", "detail-add-to-chart-btn");
    add_to_chart_btn.textContent = "加入購物車";
    add_to_chart_btn.onclick = (event) => {
        event.preventDefault();
        alert('已加入購物車');
        checkout(event)
    }
    add_to_chart.appendChild(add_to_chart_btn);

    detail_color_size_quanity.appendChild(add_to_chart);
}

function createSelectColorsSizesQuantities(primary_info_dom, colors, sizes, variants) {

    let detail_color_size_quanity = document.createElement("div");
    detail_color_size_quanity.setAttribute("class", "detail-color-size-quanity");

    createSelectColors(detail_color_size_quanity, colors, variants)
    createSelectSizes(detail_color_size_quanity, sizes, variants)
    createSelectQuanity(detail_color_size_quanity)
    createAddToChartBtn(detail_color_size_quanity)

    primary_info_dom.appendChild(detail_color_size_quanity);

}


function createNoteTexturePlace(primary_info_dom, note, texture, place, wash) {

    let deatil_note_texture_place = document.createElement("div");
    deatil_note_texture_place.setAttribute("class", "detail-note-texture-place");

    let detail_note = document.createElement("p");
    detail_note.setAttribute("class", "detail-note");
    detail_note.textContent = `注意事項：${note}`;

    let detail_texture = document.createElement("p");
    detail_texture.setAttribute("class", "detail-texture");
    detail_texture.textContent = `材質：${texture}`;

    let detail_wash = document.createElement("p");
    detail_wash.setAttribute("class", "detail-place");
    detail_wash.textContent = `洗滌： ${wash}`;

    let detail_place = document.createElement("p");
    detail_place.setAttribute("class", "detail-place");
    detail_place.textContent = `產地：${place}`;

    deatil_note_texture_place.appendChild(detail_note);
    deatil_note_texture_place.appendChild(detail_texture);
    deatil_note_texture_place.appendChild(detail_place);
    deatil_note_texture_place.appendChild(detail_wash);
    primary_info_dom.appendChild(deatil_note_texture_place);

}

function createPrimaryInfo(product_container_dom, product) {
    const { colors, description, id, images, main_image,
        note, place, price, sizes, story, texture, title, variants, wash
    } = product;

    let primary_info_dom = document.createElement("div");
    primary_info_dom.setAttribute("class", "detail-primary");

    createTitleIdPrice(primary_info_dom, title, id, price)
    createSelectColorsSizesQuantities(primary_info_dom, colors, sizes, variants)
    createNoteTexturePlace(primary_info_dom, note, texture, place, wash)

    product_container_dom.appendChild(primary_info_dom);
}


function createDeatilDescription(more_container_dom, product) {

    const { colors, description, id, images, main_image,
        note, place, price, sizes, story, texture, title, variants, wash
    } = product;

    let more_detail = document.createElement("div");
    more_detail.setAttribute("class", "product-detail-description");

    let seperate_part = document.createElement("div");
    seperate_part.setAttribute("class", "seperate-part");

    let more_detail_title = document.createElement("p");
    more_detail_title.setAttribute("class", "detail-title");
    more_detail_title.textContent = "細部說明"

    let more_detail_line = document.createElement("div");
    more_detail_line.setAttribute("class", "seperate-line");

    seperate_part.appendChild(more_detail_title)
    seperate_part.appendChild(more_detail_line)

    more_detail.appendChild(seperate_part)

    let detail_first = document.createElement("div");
    detail_first.setAttribute("class", "detail-first-part");

    let detail_text = document.createElement("p");
    detail_text.setAttribute("class", "detail-text");
    detail_text.textContent = story;

    let more_image_0 = product.images[0];
    let more_image_0_dom = document.createElement("div")
    more_image_0_dom.setAttribute("class", "other_image");

    let more_image_0_img = document.createElement("img");
    more_image_0_img.setAttribute("class", "other_images")
    more_image_0_img.src = more_image_0

    let more_image_1 = product.images[1];
    let more_image_1_dom = document.createElement("div")
    more_image_1_dom.setAttribute("class", "other_image");

    let more_image_1_img = document.createElement("img");
    more_image_1_img.setAttribute("class", "other_images")
    more_image_1_img.src = more_image_1

    more_image_0_dom.appendChild(more_image_0_img)
    more_image_1_dom.appendChild(more_image_1_img)

    detail_first.appendChild(detail_text)
    detail_first.appendChild(more_image_0_dom)
    detail_first.appendChild(more_image_1_dom)

    seperate_part.appendChild(more_detail_title)
    seperate_part.appendChild(more_detail_line)
    more_detail.appendChild(seperate_part)

    more_container_dom.appendChild(more_detail)
    more_container_dom.appendChild(detail_first)
}

async function productDetail(pid) {
    try {
        const url = `api/1.0/products/details?id=${pid}`
        const products = await axios.get(url);
        product = products.data.data;
        console.log(product)
        e_color = product.colors[0].code
        e_size = product.sizes[0]


        let wrapper_dom = document.querySelector(".wrapper");

        // create a product-container dom and add contents
        let product_container_dom = document.createElement("div");
        product_container_dom.setAttribute("class", "detail-product-info");

        let more_container_dom = document.createElement("div");
        more_container_dom.setAttribute("class", "product-detail-description")

        createImage(product_container_dom, product);
        createPrimaryInfo(product_container_dom, product);
        createDeatilDescription(more_container_dom, product);

        wrapper_dom.appendChild(product_container_dom);
        wrapper_dom.appendChild(more_container_dom)
    } catch (error) {
        console.error(error)
    }

}

let auth_res
async function authMember() {
    try {
        auth_res = await axios.get("/api/1.0/user/profile", {
            headers: {
                "Authorization": `${localStorage.getItem("jwt")}`
            }
        }).catch(error => {
            let err = error.response.data
            alert(err)
        })
        console.log("auth res: ", auth_res)
        return auth_res
    }
    catch (error) {
        console.log(error)
    }
}

async function checkout(event) {
    event.preventDefault
    const token = localStorage.getItem("jwt")
    try {
        if (!token) {
            alert("Please sign in/sign up first!")
            window.location.href = "/sign.html"
            return
        }
        await authMember();
    }
    catch (error) {
        console.log(error)
    }
}



