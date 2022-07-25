import Home from "./Home";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Room from "./Room";


function App() {
  

  return (
    <Router>
    <div>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path='/:name/:room' element={<Room/>}></Route>
      </Routes>
     
    </div>
    </Router>
  );
}

export default App;
