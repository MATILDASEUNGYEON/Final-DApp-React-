// web3 적용 //
import "./App.css";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Todo from "./components/Todo";
import TaskForm from "./components/newForm"; //입력창
import { Button, Collapse, ListGroup } from "react-bootstrap";
import Web3 from "web3";
import ContractABI from "./EditTodo.json";

function App(props) {
  const [tasks, setTasks] = useState(props.tasks || []); //수정
  // const [tasks, setTasks] = useState([]);
  const [account, setAccount] = useState();
  const [sortTasks, setSortTasks] = useState([]); //수정
  const [message, setMessage] = useState("");
  const [contract, setContract] = useState();

  async function getList() {
    try {
      // Ethereum 네트워크에 연결
      let [todoList, idList] = [];
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

      //스마트 컨트랙트 메서드 호출
      const result = await contract.methods
        .getTodo(sender)
        .call({ from: sender })
        .then((result) => {
          console.log(result);
          todoList = result[0];
          idList = result[1];
          console.log("todoList : ", todoList.length);
          console.log("id List : ", idList.length);
        });
      // 결과에서 할 일 목록과 ID 배열을 추출

      // 할 일 목록을 적절한 형식으로 변환하여 상태에 설정
      const formattedTasks = todoList.map((todo, index) => ({
        id: idList[index],
        title: todo.title,
        description: todo.description,
        startDate: todo.startDate,
        endDate: todo.endDate,
        status: todo.status,
      }));
      setTasks(formattedTasks);
      // console.log("formattedTasks:", formattedTasks[0]);
      // 성공 메시지 설정
      setMessage("Transaction successful");
    } catch (error) {
      // 에러 발생 시 메시지 설정
      setMessage(`Transaction failed: ${error.message}`);
    }
  }

  //계정이 바뀔때마다 getList불러옴
  useEffect(() => {
    getList();
  }, [account]);

  useEffect(() => {
    async function loadAccount() {
      if (typeof window.ethereum !== "undefined") {
        window.web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          const accounts = await window.web3.eth.getAccounts();
          setAccount(accounts[0]);

          let lotteryABI = ContractABI.abi;
          const contractAddress = "0x434DfE0c80389520826608cF92830703934DD721";
          setContract(
            new window.web3.eth.Contract(lotteryABI, contractAddress)
          );
          console.log(contract);
          // 초기 계정 로딩 시 getList 호출

          // 계정 변경 시에도 getList 호출 및 계정 업데이트
          window.ethereum.on("accountsChanged", (newAccounts) => {
            setAccount(newAccounts[0]);
            getList();
          });
        } catch (error) {
          console.log(`User denied account access error : ${error}`);
        }
      } else if (typeof window.web3 !== "undefined") {
        window.web3 = new Web3(window.web3.currentProvider);
        const accounts = await window.web3.eth.getAccounts();
        setAccount(accounts[0]);

        let lotteryABI = ContractABI.abi;
        const contractAddress = "0x434DfE0c80389520826608cF92830703934DD721";
        const contract = new window.web3.eth.Contract(
          lotteryABI,
          contractAddress
        );
        console.log(contract);
      } else {
        console.log("Failed MetaMask!");
      }
    }

    loadAccount();
  }, []);

  useEffect(() => {
    console.log("contract:", contract);
    if (contract !== undefined) {
      console.log("Calling getList() function...");
      getList();
      console.log("getList");
      getList();
    }
  }, [contract]);

  const [openForm, setOpenForm] = useState(false);
  const toggleForm = () => {
    setOpenForm(!openForm);
  };

  function changeDate(unixdate) {
    const milliseconds = Number(unixdate) * 1000;
    const date = new Date(milliseconds);
    return date.toLocaleDateString();
  }

  useEffect(() => {
    // tasks.map((task) =>
    //   console.log("tasks : ", task.status === 0n ? "등록" : "ㄴㄴ")
    // );
    const filteredTasks = tasks.filter((task) => task.title.trim() !== "");

    // 필터링된 배열을 역순으로 정렬하여 상태로 설정
    setSortTasks(filteredTasks.slice().reverse());

    // console.log(typeof tasks);
    // console.log("tasks : ", tasks.length);
    // console.log("tasks : ");
  }, [tasks]);

  const taskList = sortTasks.map((task) => (
    <ListGroup.Item key={task.id}>
      <div>
        <strong>이름:</strong> {task.title}
      </div>
      <div>
        <strong>내용:</strong> {task.description}
      </div>
      <div>
        <strong>시작일:</strong> {changeDate(task.startDate)}
      </div>
      <div>
        <strong>종료일:</strong> {changeDate(task.endDate)}
      </div>
      <div>
        <strong>상태: </strong>

        {task.status === 0n
          ? "Active"
          : task.status === 1n
          ? "Proceeding"
          : "Completed"}
      </div>

      <Todo
        id={task.id}
        title={task.title}
        description={task.description}
        startDate={task.startDate}
        endDate={task.endDate}
        status={task.status}
        getList={getList}
        tasks={tasks}
      />
    </ListGroup.Item>
  ));

  return (
    <body>
      <div className="mainDiv">
        <h1 className="title">Todo List</h1>
        <div className="myaccount">Your account is: {account}</div>
        <Button variant="success" onClick={toggleForm} className="btn__lg">
          TodoList 작성하기
        </Button>

        <Collapse in={openForm}>
          <div className="InsertForm">
            <TaskForm getList={getList} />
          </div>
        </Collapse>
        <ListGroup>{taskList}</ListGroup>
      </div>
    </body>
  );
}

export default App;
