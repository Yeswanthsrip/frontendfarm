import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import jsPDF from 'jspdf';

function App() {
  const [page, setPage] = useState('dashboard');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [userId, setUserId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');

  // Milk Entry
  const [milkDate, setMilkDate] = useState('');
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');

  // Milk History
  const [milkHistory, setMilkHistory] = useState([]);

  // Animals
  const [type, setType] = useState('Cow');
  const [animalName, setAnimalName] = useState('');
  const [age, setAge] = useState('');
  const [milkPerDay, setMilkPerDay] = useState('');
  const [animals, setAnimals] = useState([]);

  // Customers
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [customers, setCustomers] = useState([]);

  // Delivery
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [litres, setLitres] = useState('');
  const [deliveries, setDeliveries] = useState([]);

  // Billing
  const [billingCustomer, setBillingCustomer] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [pricePerLitre, setPricePerLitre] = useState('');
  const [billData, setBillData] = useState(null);

  const BASE_URL = "https://backendfarm-7lzo.onrender.com";

  // Fetch Milk History
  const fetchMilk = useCallback(async () => {
    try {
      console.log("Fetching for user:", userId);

      const res = await axios.get(
        `${BASE_URL}/milk?userId=${userId}`
      );

      console.log("Response:", res.data);

      setMilkHistory(res.data);

    } catch (err) {
      console.log(err);
    }
  }, [userId]);


  // Fetch Animal History
  const fetchAnimals = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/animal?userId=${userId}`
      );

      setAnimals(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [userId]);

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/customer?userId=${userId}`
      );

      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [userId]);

  // Fetch Deliveries

  const fetchDeliveries = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/delivery?userId=${userId}`
      );

      setDeliveries(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchMilk();
      fetchAnimals();
      fetchCustomers();
      fetchDeliveries();
    }
  }, [
    isLoggedIn,
    userId,
    fetchMilk,
    fetchAnimals,
    fetchCustomers,
    fetchDeliveries
  ]);

  // LOGIN
  const login = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/login`,
        { username, password }
      );

      setUserId(res.data.userId);
      setOwnerName(res.data.ownerName);
      setFarmAddress(res.data.farmAddress);

      setIsLoggedIn(true);
    } catch {
      alert("Invalid username or password ❌");
    }
  };

  // REGISTER
  const register = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        username,
        password,
        ownerName,
        farmAddress
      });

      alert("Account Created ✅");
      setIsRegister(false);
    } catch {
      alert("Register Failed ❌");
    }
  };

  // ADD MILK
  const addMilk = async () => {
  try {

    console.log("Saving:", {
      userId,
      date: milkDate,
      morning,
      evening
    });

    await axios.post(`${BASE_URL}/milk/add`, {
      userId,
      date: milkDate,
      morning: Number(morning),
      evening: Number(evening)
    });

    fetchMilk();

    alert("Milk Added ✅");

    setMilkDate('');
    setMorning('');
    setEvening('');

    } catch (err) {

      if (err.response?.status === 409) {

        const replace = window.confirm(
          "Data already exists for this date.\nReplace old data?"
        );

        if (replace) {

          await axios.put(`${BASE_URL}/milk/update`, {
            userId,
            date: milkDate,
            morning: Number(morning),
            evening: Number(evening)
          });

          fetchMilk();

          alert("Data Updated ✅");
        }

        return;
      }

      alert("Failed ❌");
    }
  };


  // DELETE MILK

  const deleteMilk = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this milk entry?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${BASE_URL}/milk/delete/${id}`
      );

      fetchMilk();

      alert("Milk Entry Deleted ✅");

    } catch (err) {
      console.log(err);
      alert("Delete Failed ❌");
    }
  };

  //Add Animal
  const addAnimal = async () => {
    try {
      await axios.post(`${BASE_URL}/animal/add`, {
        userId,
        type,
        name: animalName,
        age: Number(age),
        milkPerDay: Number(milkPerDay)
      });

      fetchAnimals();

      setAnimalName('');
      setAge('');
      setMilkPerDay('');

      alert("Animal Added ✅");

    } catch (err) {

        if (err.response?.status === 409) {

          const update = window.confirm(
            "Animal already exists.\nUpdate animal details?"
          );

          if (update) {

            await axios.put(`${BASE_URL}/animal/update`, {
              userId,
              type,
              name: animalName,
              age: Number(age),
              milkPerDay: Number(milkPerDay)
            });

            fetchAnimals();

            setAnimalName('');
            setAge('');
            setMilkPerDay('');

            alert("Animal Updated ✅");
          }

          return;
        }

        console.log(err);
        alert("Failed ❌");
      }
  };

  //delete ANimal

  const deleteAnimal = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this animal?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${BASE_URL}/animal/delete/${id}`
      );

      fetchAnimals();

      alert("Animal Deleted ✅");

    } catch (err) {
      console.log(err);
      alert("Delete Failed ❌");
    }
  };


  // add Customers


  const addCustomer = async () => {
    try {
      await axios.post(`${BASE_URL}/customer/add`, {
        userId,
        name: customerName,
        phone,
        address,
        apartment
      });

      fetchCustomers();

      setCustomerName('');
      setPhone('');
      setAddress('');
      setApartment('');

      alert("Customer Added ✅");

    } catch (err) {

      if (err.response?.status === 409) {

        const update = window.confirm(
          "Customer already exists.\nUpdate customer details?"
        );

        if (update) {

          await axios.put(`${BASE_URL}/customer/update`, {
            userId,
            name: customerName,
            phone,
            address,
            apartment
          });

          fetchCustomers();

          alert("Customer Updated ✅");
        }

        return;
      }

      console.log(err);
      alert("Failed ❌");
    }
  };

  //delete customer

  const deleteCustomer = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this customer?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${BASE_URL}/customer/delete/${id}`
      );

      fetchCustomers();

      alert("Customer Deleted ✅");

    } catch (err) {
      console.log(err);
      alert("Delete Failed ❌");
    }
  };

  //add delivery

  const addDelivery = async () => {
    try {

      await axios.post(`${BASE_URL}/delivery/add`, {
        userId,
        customerId: selectedCustomer,
        date: deliveryDate,
        litres: Number(litres)
      });

      fetchDeliveries();

      setSelectedCustomer('');
      setDeliveryDate('');
      setLitres('');

      alert("Delivery Added ✅");

    } catch (err) {

      if (err.response?.status === 409) {

        const update = window.confirm(
          "Delivery already exists.\nUpdate delivery?"
        );

        if (update) {

          await axios.put(`${BASE_URL}/delivery/update`, {
            userId,
            customerId: selectedCustomer,
            date: deliveryDate,
            litres: Number(litres)
          });

          fetchDeliveries();

          alert("Delivery Updated ✅");
        }

        return;
      }

      console.log(err);
      alert("Failed ❌");
    }
  };

  //delete delivery

  const deleteDelivery = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this delivery?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${BASE_URL}/delivery/delete/${id}`
      );

      fetchDeliveries();

      alert("Delivery Deleted ✅");

    } catch (err) {
      console.log(err);
      alert("Delete Failed ❌");
    }
  };

  //generate bill

  const generateBill = () => {

    const filteredDeliveries = deliveries.filter((d) => {

      const sameCustomer =
        d.customerId === billingCustomer;

      const sameMonth =
        d.date.startsWith(billingMonth);

      return sameCustomer && sameMonth;
    });

    const totalLitres = filteredDeliveries.reduce(
      (sum, d) => sum + d.litres,
      0
    );

    const totalAmount =
      totalLitres * Number(pricePerLitre);

    setBillData({
      totalLitres,
      totalAmount
    });
  };

  //download PDF

  const downloadPDF = () => {

    if (!billData) {
      alert("Generate bill first ❌");
      return;
    }

    const customer = customers.find(
      (c) => c._id === billingCustomer
    );

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Dairy Farm Monthly Bill", 20, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${customer?.name}`, 20, 40);
    doc.text(`Month: ${billingMonth}`, 20, 50);
    doc.text(
      `Total Litres: ${billData.totalLitres} L`,
      20,
      60
    );
    doc.text(
      `Rate: ₹${pricePerLitre}/L`,
      20,
      70
    );
    doc.text(
      `Total Amount: ₹${billData.totalAmount}`,
      20,
      80
    );

    doc.save("Monthly_Bill.pdf");
  };

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="card">

          <h2>{isRegister ? "Sign Up" : "Login"}</h2>

          <input
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />

          {isRegister && (
            <>
              <input
                placeholder="Owner Name"
                onChange={e => setOwnerName(e.target.value)}
              />

              <input
                placeholder="Farm Address"
                onChange={e => setFarmAddress(e.target.value)}
              />
            </>
          )}

          <button onClick={isRegister ? register : login}>
            {isRegister ? "SIGN UP" : "LOGIN"}
          </button>

          <p
            className="link"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Back to Login" : "Create Account"}
          </p>

        </div>
      </div>
    );
  }

  // DASHBOARD PAGE

  const totalAnimals = animals.length;

  const totalCustomers = customers.length;

  const totalMilk = milkHistory.reduce(
    (sum, m) => sum + m.total,
    0
  );

  const totalDelivered = deliveries.reduce(
    (sum, d) => sum + d.litres,
    0
  );

  return (
    <div className="container">

      {/* DASHBOARD */}
      {page === 'dashboard' && (
        <div className="grid">

          <div onClick={() => setPage('milk')}>
            <span>🥛</span>Dairy Milk Entry
          </div>

          <div onClick={() => alert("repati kosam...")}>
            <span>🧍</span>Milk Individual
          </div>

          <div onClick={() => setPage('animals')}>
            <span>🐄</span>Manage Animals
          </div>

          <div onClick={() => setPage('customers')}>
            <span>👥</span>Manage Customers
          </div>

          <div onClick={() => setPage('delivery')}>
            <span>🚚</span>Milk Delivery
          </div>

          <div onClick={() => setPage('billing')}>
            <span>💰</span>Monthly Billing
          </div>

          <div onClick={() => setPage('summary')}>
            <span>📊</span>Farm Summary
          </div>

        </div>
      )}

      {/* MILK ENTRY */}
      {page === 'milk' && (
        <div className="card">

          <button onClick={() => setPage('dashboard')}>
            ⬅ Back
          </button>

          <h3>Dairy Milk Entry</h3>

          <input
            type="date"
            value={milkDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setMilkDate(e.target.value)}
          />

          <input
            placeholder="Morning Milk"
            value={morning}
            onChange={e => setMorning(e.target.value)}
          />

          <input
            placeholder="Evening Milk"
            value={evening}
            onChange={e => setEvening(e.target.value)}
          />

          <button onClick={addMilk}>
            Save
          </button>

          <h3>Milk History</h3>

          {milkHistory.length === 0 ? (
            <p>No Records Found</p>
          ) : (
            milkHistory.map((m) => (
              <div
                key={m._id}
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  marginTop: "10px",
                  borderRadius: "10px"
                }}
              >
                <p><b>Date:</b> {m.date}</p>
                <p><b>Morning:</b> {m.morning} L</p>
                <p><b>Evening:</b> {m.evening} L</p>
                <p><b>Total:</b> {m.total} L</p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px"
                  }}
                >
                  <button
                    style={{ flex: 1, marginTop: 0 }}
                    onClick={() => {
                      setMilkDate(m.date);
                      setMorning(m.morning);
                      setEvening(m.evening);
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    style={{
                      flex: 1,
                      marginTop: 0,
                      background: "red"
                    }}
                    onClick={() => deleteMilk(m._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      )}

      {/* ANIMALS Entry */}

      {page === 'animals' && (
        <div className="card">

          <button onClick={() => setPage('dashboard')}>
            ⬅ Back
          </button>

          <h3>Manage Animals</h3>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Cow</option>
            <option>Buffalo</option>
          </select>

          <input
            placeholder="Animal Name"
            value={animalName}
            onChange={(e) => setAnimalName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <input
            type="number"
            placeholder="Milk Per Day"
            value={milkPerDay}
            onChange={(e) => setMilkPerDay(e.target.value)}
          />

          <button onClick={addAnimal}>
            Add Animal
          </button>

          <h3>Animal List</h3>

          {animals.length === 0 ? (
            <p>No Animals Found</p>
          ) : (
            animals.map((a) => (
              <div
                key={a._id}
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  marginTop: "10px",
                  borderRadius: "10px"
                }}
              >
                <p><b>Type:</b> {a.type}</p>
                <p><b>Name:</b> {a.name}</p>
                <p><b>Age:</b> {a.age}</p>
                <p><b>Milk:</b> {a.milkPerDay} L/day</p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px"
                  }}
                >
                  <button
                    style={{ flex: 1, marginTop: 0 }}
                    onClick={() => {
                      setType(a.type);
                      setAnimalName(a.name);
                      setAge(a.age);
                      setMilkPerDay(a.milkPerDay);
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    style={{
                      flex: 1,
                      marginTop: 0,
                      background: "red"
                    }}
                    onClick={() => deleteAnimal(a._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      )}


      {/* CUSTOMERS Entry */}

      {page === 'customers' && (
        <div className="card">

          <button onClick={() => setPage('dashboard')}>
            ⬅ Back
          </button>

          <h3>Manage Customers</h3>

          <input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            placeholder="Apartment / Area"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />

          <button onClick={addCustomer}>
            Add Customer
          </button>

          <h3>Customer List</h3>

          {customers.length === 0 ? (
            <p>No Customers Found</p>
          ) : (
            customers.map((c) => (
              <div
                key={c._id}
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  marginTop: "10px",
                  borderRadius: "10px"
                }}
              >
                <p><b>Name:</b> {c.name}</p>
                <p><b>Phone:</b> {c.phone}</p>
                <p><b>Address:</b> {c.address}</p>
                <p><b>Area:</b> {c.apartment}</p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px"
                  }}
                >
                  <button
                    style={{ flex: 1, marginTop: 0 }}
                    onClick={() => {
                      setCustomerName(c.name);
                      setPhone(c.phone);
                      setAddress(c.address);
                      setApartment(c.apartment);
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    style={{
                      flex: 1,
                      marginTop: 0,
                      background: "red"
                    }}
                    onClick={() => deleteCustomer(c._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      )}

      {/* DELIVERY Entry */}

      {page === 'delivery' && (
        <div className="card">

          <button onClick={() => setPage('dashboard')}>
            ⬅ Back
          </button>

          <h3>Milk Delivery</h3>

          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">Select Customer</option>

            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={deliveryDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />

          <input
            type="number"
            placeholder="Litres Delivered"
            value={litres}
            onChange={(e) => setLitres(e.target.value)}
          />

          <button onClick={addDelivery}>
            Save Delivery
          </button>

          <h3>Delivery History</h3>

          {deliveries.length === 0 ? (
            <p>No Deliveries Found</p>
          ) : (
            deliveries.map((d) => {

              const customer = customers.find(
                (c) => c._id === d.customerId
              );

              return (
                <div
                  key={d._id}
                  style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    marginTop: "10px",
                    borderRadius: "10px"
                  }}
                >
                  <p>
                    <b>Customer:</b>{" "}
                    {customer?.name || "Unknown"}
                  </p>

                  <p><b>Date:</b> {d.date}</p>

                  <p><b>Litres:</b> {d.litres} L</p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "10px"
                    }}
                  >
                    <button
                      style={{
                        flex: 1,
                        marginTop: 0
                      }}
                      onClick={() => {
                        setSelectedCustomer(d.customerId);
                        setDeliveryDate(d.date);
                        setLitres(d.litres);
                      }}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      style={{
                        flex: 1,
                        marginTop: 0,
                        background: "red"
                      }}
                      onClick={() => deleteDelivery(d._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </div>
              );
            })
          )}

        </div>
      )}

      {/* BILLING */ }
      {page === 'billing' && (
        <div className="card">

          <button onClick={() => setPage('dashboard')}>
            ⬅ Back
          </button>

          <h3>Monthly Billing</h3>

          <select
            value={billingCustomer}
            onChange={(e) => setBillingCustomer(e.target.value)}
          >
            <option value="">Select Customer</option>

            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price Per Litre"
            value={pricePerLitre}
            onChange={(e) => setPricePerLitre(e.target.value)}
          />

          <button onClick={generateBill}>
            Generate Bill
          </button>

          {billData && (
            <>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  marginTop: "15px",
                  borderRadius: "10px"
                }}
              >
                <p>
                  <b>Total Litres:</b> {billData.totalLitres} L
                </p>

                <p>
                  <b>Total Amount:</b> ₹{billData.totalAmount}
                </p>
              </div>

              <button onClick={downloadPDF}>
                📄 Download PDF
              </button>
            </>
          )}

        </div>
      )}

      {/* SUMMARY */}
      {page === 'summary' && (
        <div className="card">    

          <button onClick={() => setPage('dashboard')}>
            ⬅ Back
          </button>

          <h3>Farm Summary</h3>

          <p><b>Owner:</b> {ownerName}</p>
          <p><b>Address:</b> {farmAddress}</p>

          <hr />

          <p>
            <b>Total Animals:</b> {totalAnimals}
          </p>

          <p>
            <b>Total Customers:</b> {totalCustomers}
          </p>

          <p>
            <b>Total Milk Collected:</b> {totalMilk} L
          </p>

          <p>
            <b>Total Milk Delivered:</b> {totalDelivered} L
          </p>

          <p>
            <b>Total Milk Entries:</b> {milkHistory.length}
          </p>

        </div>
      )}

    </div>
  );
}

export default App;