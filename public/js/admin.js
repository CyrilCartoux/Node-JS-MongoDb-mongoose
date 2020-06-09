const deleteProduct = (btn) => {
    console.log('clicked')
    const prodId = btn.parentNode.querySelector("[name=productId]").value;
    const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
    const productElement = btn.closest('article');

    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrfToken
        }
    }).then(res => {
        return res.json()
    })
        .then(data => {
            console.log(data)
            // == ==> " {message: "Success!"} "
            productElement.remove();
        })
        .catch(err => {
            console.log(err)
        })
};
