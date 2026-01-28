import Student from './pages/examples/Student'
import Student1 from './pages/examples/Student1'
import Student2 from './pages/examples/Student2'
import Student3 from './pages/examples/Student3'
function App() {
  return (
    <>
        <h1>Welcome to Expense App</h1> 
        <Student />
        <Student1 />
        <Student2 />
        <Student3 name='Tommy' rollNumber={20} percentage={45.0} />

    </>
  )
}

export default App