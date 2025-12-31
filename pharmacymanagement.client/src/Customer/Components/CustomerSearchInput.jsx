import "../CustomerCss/CustomerSeach.css";
function CustomerSearchInput({text }) {
  return (
      <div className="customer-search-container-input">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder={text}></input>
      </div>
  );
}

export default CustomerSearchInput;