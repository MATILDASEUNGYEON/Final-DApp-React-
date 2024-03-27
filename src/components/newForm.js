import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import Web3 from "web3";
import YourContractABI from "../EditTodo.json";
import ToggleButtonExample from "./Button";

function TaskForm({ getList }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    newStartDate: "",
    newEndDate: "",
    status: "",
  });

  const [buttonName, setButtonName] = useState("add");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTask({
      ...task,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log("task : ", task);
  }, [task]);

  const statusChange = (newValue) => {
    console.log(newValue);
    setTask((prevTask) => ({
      ...prevTask,
      status: newValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (buttonName === "추가 중...") {
      alert("진행 중입니다.");
      return;
    }
    setButtonName("추가 중...");

    try {
      // Ethereum 네트워크에 연결
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];
      // const balances = await web3.eth.getBalance(sender);
      const contractABI = YourContractABI.abi;
      const contractAddress = "0x434DfE0c80389520826608cF92830703934DD721";
      const contractInstance = new web3.eth.Contract(
        contractABI,
        contractAddress
      );

      // 시작일과 종료일을 uint256로 변환 [입력 != contract]
      const startDateTimestamp = Date.parse(task.newStartDate) / 1000;
      const endDateTimestamp = Date.parse(task.newEndDate) / 1000;

      // 스마트 컨트랙트 메서드 호출
      const result = await contractInstance.methods
        .createTodo(
          task.title,
          task.description,
          startDateTimestamp,
          endDateTimestamp,
          task.status
        )
        .send({ from: sender })

        .then((result) => {
          console.log(result);
          alert("추가가 완료되었습니다.");
          setButtonName("add");
          // 폼 전송 후 입력 필드 초기화
          setTask({
            title: "",
            description: "",
            newStartDate: "",
            newEndDate: "",
            status: "",
          });
          getList();
        })
        .catch((err) => {
          console.error(err);
          setButtonName("add");
        });
      // const logs = result.events.TodoCreated.returnValues;
      // console.log("TodoId", logs.todoId);
      // console.log("result= ", result);

      // console.log(task);
      // console.log("addTask", addTask);
      // 성공 메시지 설정
      console.log(
        `Transaction successful. Transaction Hash: ${result.transactionHash}`
      );
    } catch (error) {
      // 에러 발생 시 메시지 설정
      console.log(error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formName">
        <Form.Label>이름:</Form.Label>
        <Form.Control
          type="text"
          name="title"
          placeholder="작업 이름을 입력하세요"
          value={task.title}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="formDescription">
        <Form.Label>내용:</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          placeholder="작업 내용을 입력하세요"
          value={task.description}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="formStartDate">
        <Form.Label>시작일: </Form.Label>
        <Form.Control
          type="date"
          name="newStartDate"
          // value={changeDate(task.newStartDate)}
          value={task.newStartDate}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group controlId="formEndDate">
        <Form.Label>종료일: </Form.Label>
        <Form.Control
          type="date"
          name="newEndDate"
          // value={changeDate(task.newEndDate)}
          value={task.newEndDate}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group controlId="formStatus">
        <Form.Label>상태:</Form.Label>
        <div className="StatusButton">
          <ToggleButtonExample
            className="StatusButton"
            value={task.status}
            name="status"
            onChange={statusChange}
          />
        </div>
      </Form.Group>

      <Button
        variant="success"
        type="submit"
        className="btn btn__primary btn__lg"
      >
        {buttonName}
      </Button>
    </Form>
  );
}

export default TaskForm;

// function changeDate(unixdate) {
//   const milliseconds = Number(unixdate) * 1000;
//   const date = new Date(milliseconds);
//   return date.toLocaleDateString();
