import "../SharedComponentsStyles/DeleteModal.css"
function DeleteModal({ captionText, children }) {
  return (
      <div className="DeleteModalGeneral">
          <div className="delete-modal-content">
              {/*<i class="fa-solid fa-circle-exclamation delete-icon"></i>*/}
              <i class="fa-solid fa-exclamation delete-icon"></i>
              <p className="success-caption-text">{captionText}</p>
              {children}
          </div>

      </div>
  );
}

export default DeleteModal;