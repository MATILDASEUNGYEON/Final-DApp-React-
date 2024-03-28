// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EditTodo{

    //enum[나열형]
    enum Status{
        todo,
        doing,
        done
    }

    //구조체
    struct Todo{
        string title;
        string description;
        uint startDate;
        uint endDate;
        Status status;
    }

    //매핑(Mapping)
    //기본 형태 [mapping(Key => Value) 접근제한자 변수이름]
    mapping(address => mapping(uint256 => Todo)) public todos;
    mapping(address => uint256) public TodoId; //TodoCnt[할일 수]
    mapping(address => uint256[]) public getId; //TokenId의 배열

    //Event
    event TodoCreated(address indexed user, uint256 indexed todoId, string title, string description, uint256 startDate, uint256 endDate, Status status);
    event TodoDeleted(address indexed user,uint256 indexed  todoId);
    event TodoUpdated(address indexed user, uint256 indexed todoId, string title, string description, uint256 startDate,uint256 endDate, Status status);
    
    //Function
    function generateTodoId(address user, string memory title, string memory description, uint256 startDate, uint256 endDate, Status status) internal view returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(user, title, description, startDate, endDate, status, block.timestamp));
        return uint256(hash);
    }
    
    function createTodo(string memory title, string memory description, uint256 startDate, uint256 endDate, Status status) external returns(uint256,string memory,string memory,uint256,uint256,Status){
   
        uint256 newTodoId = generateTodoId(msg.sender, title, description, startDate, endDate, status);

        todos[msg.sender][newTodoId] = Todo({
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            status: status
        });

        TodoId[msg.sender]++;
        getId[msg.sender].push(newTodoId);
        emit TodoCreated(msg.sender, newTodoId, title, description, startDate, endDate, status);
        return(newTodoId,title,description,startDate,endDate,status);
    }
    
    function getTodo(address user) external view returns (Todo[] memory,uint256[] memory) {
        uint256[] storage tokenIDs = getId[user];
        Todo[] memory userTodos = new Todo[](tokenIDs.length);

        for (uint256 i = 0; i < tokenIDs.length; i++) {
            uint256 tokenID = tokenIDs[i];
            userTodos[i] = todos[msg.sender][tokenID];
        }
        return (userTodos,tokenIDs);
    }
        
    function deleteTodo(uint256 todoId) external {
        delete todos[msg.sender][todoId];
        TodoId[msg.sender]--;

        emit TodoDeleted(msg.sender, todoId);
    }

    function updateTodo(uint256 tokenId,string memory title, string memory description, uint startDate, uint endDate, Status status) external {
        
        todos[msg.sender][tokenId].title = title;
        todos[msg.sender][tokenId].description = description;
        todos[msg.sender][tokenId].startDate = startDate;
        todos[msg.sender][tokenId].endDate = endDate;
        todos[msg.sender][tokenId].status = status;

        emit TodoUpdated(msg.sender, tokenId, title, description, startDate, endDate, status);
    }
   

}
