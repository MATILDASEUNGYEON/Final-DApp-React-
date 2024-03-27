// ToggleButtonExample 컴포넌트
import React from "react";
import { ButtonGroup, ToggleButton } from "react-bootstrap";

function ToggleButtonExample({ value, onChange }) {
  const radios = [
    { name: "Active", value: "0" }, //todo
    { name: "Proceeding", value: "1" }, //doing
    { name: "completed", value: "2" }, //done
  ];

  const handleStatusChange = (newValue) => {
    onChange(newValue);
    console.log("cr : ", newValue);
  };

  return (
    <ButtonGroup>
      {radios.map((radio, idx) => (
        <ToggleButton
          key={idx}
          id={`radio-${idx}`}
          type="radio"
          variant={idx % 2 ? "outline-success" : "outline-danger"}
          name="status"
          value={radio.value}
          checked={value === radio.value}
          onChange={() => handleStatusChange(radio.value)}
        >
          {radio.name}
        </ToggleButton>
      ))}
    </ButtonGroup>
  );
}

export default ToggleButtonExample;
