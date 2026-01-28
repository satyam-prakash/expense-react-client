import Student from './pages/examples/Student'
import Student1 from './pages/examples/Student1'
import Student2 from './pages/examples/Student2'
import Student3 from './pages/examples/Student3'
import StudentList from './pages/examples/StudentList'
import StudentList1 from './pages/examples/StudentList1'
import UserCard from './pages/practice/userCard'
function App() {
  const students = [
    { name: 'Alice', rollNumber: 101, percentage: 85.5 },
    { name: 'Bob', rollNumber: 102, percentage: 72.3 },
    { name: 'Charlie', rollNumber: 103, percentage: 28.7 },
    { name: 'David', rollNumber: 104, percentage: 91.2 }
  ];

  return (
    <>
        <h1>Welcome to Expense App</h1> 
        <Student />
        <Student1 />
        <Student2 />
        <Student3 name='Tommy' rollNumber={20} percentage={45.0} />
        <StudentList students={students} />
        <StudentList1 students={students} />
        
        <h2>User Cards</h2>
        <UserCard name="John Doe" isPremium={true} />
        <UserCard name="Jane Smith" isPremium={false} />
    </>
  )
}

export default App