import "../SharedComponentsStyles/SuccessModal.css"
function SuccessModal({ captionText, children}) {
    return (
      
      <div className="sucessModalGeneral"> 
          <div className="success-modal-content"> 
                {/*<i className="fa-regular fa-circle-check succes-modal-icon"></i>*/}
                <i class="fa-solid fa-check succes-modal-icon"></i>
              <p className="success-caption-text">{captionText}</p>
              {children}
          </div>
  
      </div>
  );
}
export default SuccessModal;