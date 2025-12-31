import "../CustomerCss/OrderPreviewModal.css"
function OrderpreviewModal({ children, onClose }) {
    return (
        <div className="OrderPreviewModal">
            <div className="order-preview-modal-content">

                <div className="button-go-container">
                    <button className="back-arrow-preview" onClick={onClose}>
                        <i className="fa-solid fa-arrow-left-long"></i>
                    </button>  
                </div>
                              
                <h1>Order Preview</h1>
                <div className="order-preview-header">
                    <div>Items</div>
                    <div>Price</div>
                    <div>Quantity</div>
                    <div>Total</div>
                    <div></div>
                </div>

                {children}
            </div>

        </div>
    );
}

export default OrderpreviewModal;