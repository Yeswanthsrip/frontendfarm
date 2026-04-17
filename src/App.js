import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [page, setPage] = useState('animals');

  // 🔐 Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');

  // 🐄 Animals
  const [animals, setAnimals] = useState([]);
  const [type, setType] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [age, setAge] = useState('');
  const [milkPerDay, setMilkPerDay] = useState('');

  // 👤 Customers
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');

  // 🚚 Delivery
  const [deliveries, setDeliveries] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState('');
  const [litres, setLitres] = useState('');

  // 💰 Billing
  const [billCustomerId, setBillCustomerId] = useState('');
  const [price, setPrice] = useState('');
  const [month, setMonth] = useState('');
  const [bill, setBill] = useState(null);

  const BASE_URL = "https://backendfarm-7lzo.onrender.com";

  // 🔄 Fetch
  const fetchAnimals = useCallback(async () => {
    const res = await axios.get(`${BASE_URL}/animal?userId=${userId}`);
    setAnimals(res.data);
  }, [userId]);

  const fetchCustomers = useCallback(async () => {
    const res = await axios.get(`${BASE_URL}/customer?userId=${userId}`);
    setCustomers(res.data);
  }, [userId]);

  const fetchDeliveries = useCallback(async () => {
    const res = await axios.get(`${BASE_URL}/delivery?userId=${userId}`);
    setDeliveries(res.data);
  }, [userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchAnimals();
      fetchCustomers();
      fetchDeliveries();
    }
  }, [isLoggedIn, userId, fetchAnimals, fetchCustomers, fetchDeliveries]);

  // 🔐 Login
  const login = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
      setUserId(res.data.userId);
      setIsLoggedIn(true);
    } catch {
      alert('Login failed ❌');
    }
  };

  // 📝 Register
  const register = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/register`, { username, password });
      alert('Registered ✅');
      setIsRegister(false);
    } catch {
      alert('Register failed ❌');
    }
  };

  // 🐄 Add Animal
  const addAnimal = async () => {
    await axios.post(`${BASE_URL}/animal/add`, {
      userId,
      type,
      name: animalName,
      age: Number(age),
      milkPerDay: Number(milkPerDay)
    });

    setType('');
    setAnimalName('');
    setAge('');
    setMilkPerDay('');
    fetchAnimals();
  };

  // 👤 Add Customer
  const addCustomer = async () => {
    await axios.post(`${BASE_URL}/customer/add`, { userId, name });
    setName('');
    fetchCustomers();
  };

  // 🚚 Add Delivery
  const addDelivery = async () => {
    await axios.post(`${BASE_URL}/delivery/add`, {
      userId,
      customerId,
      date,
      litres: Number(litres)
    });

    setDate('');
    setLitres('');
    fetchDeliveries();
  };

  // 💰 Billing
  const generateBill = async () => {
    const res = await axios.post(`${BASE_URL}/billing/generate`, {
      userId,
      customerId: billCustomerId,
      pricePerLitre: Number(price),
      month
    });

    setBill(res.data);
  };

  const getTotalMilk = () => animals.reduce((sum, a) => sum + a.milkPerDay, 0);
  const getTotalDeliveredMilk = () => deliveries.reduce((sum, d) => sum + d.litres, 0);
  const getRemainingMilk = () => getTotalMilk() - getTotalDeliveredMilk();

  // 🔐 LOGIN UI
  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="card">
          <h2>{isRegister ? 'Register' : 'Login'}</h2>
          <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={isRegister ? register : login}>
            {isRegister ? 'Register' : 'Login'}
          </button>
          <button onClick={() => setIsRegister(!isRegister)}>Switch</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">

      {/* 🔝 HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🐄 Dairy App</h2>

        {/* 🏡 HOME TOP RIGHT */}
        <div onClick={() => setPage('home')} style={{ fontSize: 28, cursor: 'pointer' }}>
          🏡
        </div>
      </div>

      {/* 🏡 HOME */}
      {page === 'home' && (
        <div className="card">
          <h3>Owner Details</h3>

          <p><b>Name:</b> Yeswanth Sri</p>
          <p><b>Address:</b> Pothavaram</p>

          <p><b>Cows:</b> {animals.filter(a => a.type === 'Cow').length}</p>
          <p><b>Buffalos:</b> {animals.filter(a => a.type === 'Buffalo').length}</p>

          <p><b>Monthly Milk:</b> {getTotalMilk() * 30} L</p>
        </div>
      )}

      {/* 🐄 ANIMALS */}
      {page === 'animals' && (
        <div className="card">
          <h3>Animals</h3>

          <input placeholder="Type" value={type} onChange={e => setType(e.target.value)} />
          <input placeholder="Name" value={animalName} onChange={e => setAnimalName(e.target.value)} />
          <input placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
          <input placeholder="Milk/day" value={milkPerDay} onChange={e => setMilkPerDay(e.target.value)} />
          <button onClick={addAnimal}>Add</button>

          <div className="stats">
            🥛 {getTotalMilk()}L | 🚚 {getTotalDeliveredMilk()}L | 🧊 {getRemainingMilk()}L
          </div>

          {animals.map(a => (
            <div key={a._id}>
              🐄 {a.type} - {a.name} ({a.age}) - 🥛 {a.milkPerDay}L
            </div>
          ))}
        </div>
      )}

      {/* 👤 CUSTOMER */}
      {page === 'customer' && (
        <div className="card">
          <h3>Customer</h3>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={addCustomer}>Add</button>
        </div>
      )}

      {/* 🚚 DELIVERY */}
      {page === 'delivery' && (
        <div className="card">
          <h3>Delivery</h3>

          <select onChange={e => setCustomerId(e.target.value)}>
            <option>Select Customer</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <input placeholder="Date" value={date} onChange={e => setDate(e.target.value)} />
          <input placeholder="Litres" value={litres} onChange={e => setLitres(e.target.value)} />

          <button onClick={addDelivery}>Add Delivery</button>
        </div>
      )}

      {/* 💰 BILLING */}
      {page === 'billing' && (
        <div className="card">
          <h3>Billing</h3>

          <select onChange={e => setBillCustomerId(e.target.value)}>
            <option>Select Customer</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
          <input placeholder="Month" value={month} onChange={e => setMonth(e.target.value)} />

          <button onClick={generateBill}>Generate</button>

          {bill && <h3>₹ {bill.totalAmount}</h3>}
        </div>
      )}

      {/* 🔻 NAVBAR */}
      <div className="navbar">
        <div onClick={() => setPage('animals')}>🐄</div>
        <div onClick={() => setPage('delivery')}>🚚</div>
        <div onClick={() => setPage('customer')}>👤</div>
        <div onClick={() => setPage('billing')}>💰</div>
      </div>

    </div>
  );
}

export default App;