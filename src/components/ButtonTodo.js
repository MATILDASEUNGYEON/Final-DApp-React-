// ToggleButtonExample 컴포넌트
import React, { useEffect } from "react";
import { ButtonGroup, ToggleButton } from "react-bootstrap";

function ToggleButtonTodo({ value, onChange }) {
  const radios = [
    { name: "Active", value: "3" }, //todo
    { name: "Proceeding", value: "4" }, //doing
    { name: "completed", value: "5" }, //done
  ];

  useEffect(() => {
    // onChange(parseInt(value) + 3);
    console.log(value);
  }, []);

  const handleStatusChangeEdit = (newValueEd, test) => {
    onChange(newValueEd);
    console.log("new : ", newValueEd, "test : ", test);
    console.log("edit : ", newValueEd);
  };

  return (
    <ButtonGroup>
      {radios.map((radio, idx) => (
        <ToggleButton
          key={idx}
          id={`radio-${idx + 3}`}
          type="radio"
          variant={idx % 2 ? "outline-success" : "outline-danger"}
          name="statusEdit"
          value={radio.value}
          checked={value === parseInt(radio.value)}
          onChange={() => handleStatusChangeEdit(radio.value, value)}
        >
          {radio.name}
        </ToggleButton>
      ))}
    </ButtonGroup>
  );
}

export default ToggleButtonTodo;
