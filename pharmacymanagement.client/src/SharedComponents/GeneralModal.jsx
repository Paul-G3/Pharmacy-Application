
import '../SharedComponentsStyles/GeneralModalstyle.css'


function GeneralModal({children, title, onClose}) {
  return (
      <div className="modal-container">
          <div className="modal-background-general" onClick={onClose}>
          </div>

          <div className="content-modal">
              <button className="close-general-modal" onClick={onClose}>X</button>

              <h1 className="general-modal-title">{title}</h1>
              {children}
          </div>

      </div>
  );
}

export default GeneralModal;