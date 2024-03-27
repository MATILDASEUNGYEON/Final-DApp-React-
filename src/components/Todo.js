import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  InputGroup,
  FormControl,
  FormGroup,
} from "react-bootstrap";
import Web3 from "web3";
import ContractABI from "../EditTodo.json";
import ToggleButtonTodo from "./ButtonTodo";

function Todo(props) {
  const [isEditing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(props.title);
  const [newDescription, setNewDescription] = useState(props.description);
  const [newStartDate, setNewStartDate] = useState(changeDate(props.startDate));
  const [newEndDate, setNewEndDate] = useState(changeDate(props.endDate));
  const [newStatus, setNewStatus] = useState(parseInt(props.status) + 3);
  // const [tasks, setTasks] = useState(props.tasks);
  const [sender, setSender] = useState(null); // 발신자 주소 상태 추가
  const [buttonName, setButtonName] = useState("편집");
  const [deletebutton, setDeleteButton] = useState("삭제");
  const getList = props.getList;

  const web3 = new Web3(window.ethereum);
  const contractABI = ContractABI.abi;
  const contractAddress = "0x434DfE0c80389520826608cF92830703934DD721";
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  useEffect(() => {
    const getSender = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        setSender(accounts[0]);
      } catch (error) {
        console.error("Error getting sender address:", error);
      }
    };
    getSender();
  }, []);

  useEffect(() => {
    console.log(props.startDate);
  }, []);

  //시작일,마감일 타입 변경 함수
  function changeDate(unixdate) {
    const milliseconds = Number(unixdate) * 1000;
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더하고 두 자리로 맞춤
    const day = String(date.getDate()).padStart(2, "0"); // 일은 한 자리일 경우 앞에 0을 추가하여 두 자리로 맞춤
    return `${year}-${month}-${day}`;
  }

  function handleNameChange(e) {
    setNewTitle(e.target.value);
  }

  function handleDescriptionChange(e) {
    setNewDescription(e.target.value);
  }

  function handleStartDateChange(e) {
    setNewStartDate(e.target.value);
  }

  function handleEndDateChange(e) {
    setNewEndDate(e.target.value);
  }
  function handleStatusChange(newValue) {
    setNewStatus(newValue);
    console.log("newV", newValue);
  }
  useEffect(() => {
    console.log("New status:", newStatus);
  }, [newStatus]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (buttonName === "편집 중...") {
      alert("진행 중입니다.");
      return;
    }
    setButtonName("편집 중...");
    try {
      const startDateTimestamp = Date.parse(newStartDate) / 1000;
      const endDateTimestamp = Date.parse(newEndDate) / 1000;

      await contract.methods
        .updateTodo(
          props.id,
          newTitle,
          newDescription,
          startDateTimestamp,
          endDateTimestamp,
          newStatus - 3
        )
        .send({ from: sender })
        .then((result) => {
          alert("편집이 완료되었습니다.");
          getList();
          setButtonName("편집");
        })
        .catch((err) => {
          console.log(err);
          setButtonName("편집");
        });

      console.log("after update");

      setEditing(false);
      setButtonName("편집");
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  async function deleteHandleSubmit(e) {
    if (!window.confirm("삭제를 하시겠습니까?")) {
      alert("취소되었습니다.");
      return;
    }
    if (deletebutton === "삭제 중...") {
      alert("진행 중입니다.");
      return;
    }
    setDeleteButton("삭제 중...");
    try {
      await contract.methods
        .deleteTodo(props.id)
        .send({ from: sender })
        .then(() => {
          alert("할일이 삭제되었습니다.");
          setDeleteButton("삭제");
          getList();
          console.log("getList 호출");
        })
        .catch((err) => {
          alert("삭제가 취소되었습니다.");
          setDeleteButton("삭제");
          return;
        });
    } catch (error) {
      console.error("Error Delete todo: ", error);
    }
  }

  const editingTemplate = (
    <Form className="stack-small" onSubmit={handleSubmit}>
      <FormGroup>
        <Form.Label className="todo-label" htmlFor={`${props.id}-name`}>
          이름:
        </Form.Label>
        <InputGroup>
          <FormControl
            id={`${props.id}-name`}
            className="todo-text"
            type="text"
            value={newTitle}
            onChange={handleNameChange}
          />
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <Form.Label className="todo-label" htmlFor={`${props.id}-description`}>
          내용:
        </Form.Label>
        <InputGroup>
          <FormControl
            id={`${props.id}-description`}
            className="todo-text"
            type="text"
            value={newDescription}
            onChange={handleDescriptionChange}
          />
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <Form.Label className="todo-label" htmlFor={`${props.id}-start-date`}>
          시작일:
        </Form.Label>
        <InputGroup>
          <FormControl
            id={`${props.id}-start-date`}
            className="todo-text"
            type="date"
            value={newStartDate}
            onChange={handleStartDateChange}
          />
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <Form.Label className="todo-label" htmlFor={`${props.id}-end-date`}>
          종료일:
        </Form.Label>
        <InputGroup>
          <FormControl
            id={`${props.id}-end-date`}
            className="todo-text"
            type="date"
            value={newEndDate}
            onChange={handleEndDateChange}
          />
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <Form.Label className="todo-label" htmlFor={`${props.id}-status`}>
          상태:
        </Form.Label>
        <div className="StatusButton">
          <InputGroup>
            <ToggleButtonTodo
              className="StatusButton"
              value={parseInt(newStatus)}
              onChange={handleStatusChange}
            />
          </InputGroup>
        </div>
      </FormGroup>
      <div className="btn-group">
        <Button variant="outline-danger" onClick={() => setEditing(false)}>
          취소
        </Button>
        <Button
          variant="outline-warning"
          type="submit"
          onClick={() => console.log(props.id)}
        >
          {/* 저장 */}
          {buttonName}
        </Button>
      </div>
    </Form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="btn-group btn-margin">
        <Button variant="outline-warning" onClick={() => setEditing(true)}>
          {/* 편집 */}
          {buttonName}
        </Button>
        <Button
          variant="outline-danger"
          onClick={() => deleteHandleSubmit(props.id)}
        >
          {/* 삭제 */}
          {deletebutton}
        </Button>
      </div>
    </div>
  );

  return <li className="todo">{isEditing ? editingTemplate : viewTemplate}</li>;
}

export default Todo;
