import React from "react";

class ListErrors extends React.Component {
  render() {
    const errors = this.props.errors;
    if (errors) {
      return (
        <ul className="error-messages text-left">
          {Object.keys(errors).map((key) => {
            return (
              <li key={key} className="text-danger">
                {key} {errors[key]}
              </li>
            );
          })}
        </ul>
      );
    } else {
      return null;
    }
  }
}

export default ListErrors;
