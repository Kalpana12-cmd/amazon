import { renderOrderSummary } from '../../Scripts/checkout/orderSummary.js';
import { loadFromStorage, cart } from "../../data/cart.js";
import { loadProducts,loadProductsFetch } from '../../data/products.js';

describe('test suite : renderOrderSummary', () => {
    const productId1 = 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6';
    const productId2 = '15b6fc6f-327a-4ec4-896f-486349e85a3d';

    beforeAll((done) => {
        loadProductsFetch().then(()=>{
               done();
        });
    });

    it('displays the cart', () => {
        document.querySelector('.js-test-container').innerHTML = `
            <div class="js-order-summary"></div>
            <div class="js-payment-summary"></div>
        `;

        spyOn(localStorage, 'getItem').and.callFake(() => JSON.stringify([
            { productId: productId1, quantity: 2, deliveryOptionId: '1' },
            { productId: productId2, quantity: 1, deliveryOptionId: '2' }
        ]));

        loadFromStorage();
        renderOrderSummary();

        expect(document.querySelectorAll('.js-cart-item-container').length).toEqual(2);
        expect(document.querySelector(`.js-product-quantity-${productId1}`).innerText).toContain('Quantity: 2');
        expect(document.querySelector(`.js-product-quantity-${productId2}`).innerText).toContain('Quantity: 1');

        document.querySelector('.js-test-container').innerHTML = ``;
    });

    it('removes a product', (done) => {
        spyOn(localStorage, 'setItem');
        document.querySelector('.js-test-container').innerHTML = `
            <div class="js-order-summary"></div>
            <div class="js-payment-summary"></div>
        `;

        spyOn(localStorage, 'getItem').and.callFake(() => JSON.stringify([
            { productId: productId1, quantity: 2, deliveryOptionId: '1' },
            { productId: productId2, quantity: 1, deliveryOptionId: '2' }
        ]));

        loadFromStorage();
        renderOrderSummary();

        setTimeout(() => {
            const deleteButton = document.querySelector(`.js-delete-link-${productId1}`);
            expect(deleteButton).not.toBeNull();
            deleteButton.dispatchEvent(new Event('click'));

            setTimeout(() => {
                expect(document.querySelectorAll('.js-cart-item-container').length).toEqual(1);
                expect(document.querySelector(`.js-cart-item-container-${productId1}`)).toBeNull();
                expect(document.querySelector(`.js-cart-item-container-${productId2}`)).not.toBeNull();
                done();
                document.querySelector('.js-test-container').innerHTML = ``;
            }, 200);
        }, 100);
    });
});
