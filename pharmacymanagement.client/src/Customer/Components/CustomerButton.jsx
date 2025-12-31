import "../CustomerCss/CustomerButton.css";

function CustomerButton({ text, onClick }) {
  return (
      <button className="customerButton" onClick={onClick}>{text}</button>
  );
}

export default CustomerButton;