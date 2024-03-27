import "./App.css";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Collapse, ListGroup } from "react-bootstrap";
import Web3 from "web3";
import ContractABI from "./EditTodo.json";
import Todo from "./components/Todo";
import TaskForm from "./components/newForm";

function App(props) {
  const [tasks, setTasks] = useState(props.tasks || []);
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState("");
  const [sortTasks, setSortTasks] = useState([]);
  const [contract, setContract] = useState();
  const [showFullBalance, setShowFullBalance] = useState(false);

  const handleMouseEnter = () => {
    setShowFullBalance(true);
  };

  const handleMouseLeave = () => {
    setShowFullBalance(false);
  };

  const fetchBalance = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const account = await web3.eth.getAccounts();
      const balanceWei = await web3.eth.getBalance(account[0]); // 이더 잔액 가져오기 (Wei 단위)
      const balanceEther = web3.utils.fromWei(balanceWei, "ether"); // 이더로 변환
      setBalance(balanceEther); // 상태 업데이트
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  //TodoList 가져오기
  async function getList() {
    try {
      // Ethereum 네트워크에 연결
      let [todoList, idList] = [];
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];
      const balances = await web3.eth.getBalance(sender);
      setBalance(web3.utils.fromWei(balances, "ether"));

      //스마트 컨트랙트 메서드 호출 [getTodo]
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

      // 성공 메시지 설정
      console.log("Transaction successful");
    } catch (error) {
      // 에러 발생 시 메시지 설정
      console.log(`Transaction failed: ${error.message}`);
    }
  }

  //계정이 바뀔때마다 getList불러옴
  useEffect(() => {
    getList();
  }, [account]);

  //MetaMask 연동 관련 코드
  useEffect(() => {
    async function loadAccount() {
      if (typeof window.ethereum !== "undefined") {
        window.web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          window.ethereum.on("accountsChanged", async (newAccounts) => {
            setAccount(newAccounts[0]);
            const balances = await window.web3.eth.getBalance(newAccounts[0]);
            setBalance(window.web3.utils.fromWei(balances, "ether"));
            getList();
          });

          const accounts = await window.web3.eth.getAccounts();
          setAccount(accounts[0]);
          const balances = await window.web3.eth.getBalance(accounts[0]);
          setBalance(window.web3.utils.fromWei(balances, "ether"));

          let lotteryABI = ContractABI.abi;
          const contractAddress = "0x434DfE0c80389520826608cF92830703934DD721";
          setContract(
            new window.web3.eth.Contract(lotteryABI, contractAddress)
          );
        } catch (error) {
          console.log(`User denied account access error : ${error}`);
        }
      } else {
        console.log("Failed MetaMask!");
      }
    }

    loadAccount();
  }, []);

  //contract확인 테스트코드
  useEffect(() => {
    console.log("contract:", contract);
    if (contract !== undefined) {
      console.log("Calling getList() function...");
      getList();
      console.log("getList");
      getList();
    }
  }, [contract]);
  //TodoList 입력폼 Action
  const [openForm, setOpenForm] = useState(false);
  const toggleForm = () => {
    setOpenForm(!openForm);
  };
  //시작일,종료일 형태 변환
  function changeDate(unixdate) {
    const milliseconds = Number(unixdate) * 1000;
    const date = new Date(milliseconds);
    return date.toLocaleDateString();
  }
  //TodoList 최신순으로 나열
  useEffect(() => {
    const filteredTasks = tasks.filter((task) => task.title.trim() !== "");
    // 필터링된 배열을 역순으로 정렬하여 상태로 설정
    setSortTasks(filteredTasks.slice().reverse());
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
        <div
          className="myBalance"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Eth. {showFullBalance ? balance : balance.substring(0, 6) + "..."}
        </div>
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
