import React, { useEffect, useState } from 'react';
import PayfirmaIframeTransaction from 'merrco-payfirma-simple-pay-module';
import './App.css'; 

function App() {

  let hasRun = false;
  const [payment, setPayment] = useState(null);
  const apiKey = 'your-api-key';

  useEffect(() => {
    if (!hasRun) {
      const paymentInstance = new PayfirmaIframeTransaction(apiKey, 'easypay-container');
      setPayment(paymentInstance);
      hasRun = true;
    }
  }, []);

  const handlePaymentClick = () => {
    ShowLoadingIndicator();
    payment.getPaymentToken().then((response) => {
      MakeSalesRequest(response.payment_token); // Make API request to sales endpoint
    }).catch((error) => {
      HandleError(error);
    });
  };

  const MakeSalesRequest = (paymentToken) => {
    // PROD https://apigateway.payfirma.com
    // SANDBOX https://sandbox-apigateway.payfirma.com
    // TEST https://test-apigateway.payfirma.com
    const SALE_API_END_POINT = 'https://test-apigateway.payfirma.com';

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + apiKey);

    var raw = JSON.stringify({
        "amount": 5.00,
        "payment_token": paymentToken,
        'first_name': document.querySelector('.input-field[placeholder="First Name"]').value,
        'last_name': document.querySelector('.input-field[placeholder="Last Name"]').value,
        "email": document.querySelector('.input-field[placeholder="Email Address"]').value,
        "sending_receipt": true
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(SALE_API_END_POINT + "/transaction-service/sale/token", requestOptions)
    .then(response => response.text())
    .then(result => {
        document.querySelector('#sale-result').innerText = result;
        document.querySelector('#cardtoken-result').innerText = paymentToken;
        document.querySelector('#saleResults').removeAttribute('hidden');
        document.querySelector('#tokenResults').removeAttribute('hidden');
    }).catch(error => {
        alert('Failed Making Sales Request');
    }).finally(() => {
        document.getElementById('loadingIndicator').style.display = 'none';
    });
  };

  const ShowLoadingIndicator = () => {
    document.getElementById('loadingIndicator').style.display = 'block';
    document.querySelector('#saleResults').hidden = true;
    document.querySelector('#tokenResults').hidden = true;
  };

  const HandleError = (error) => {
    alert('Error tokenizing card data. ' + error.message);
    document.getElementById('loadingIndicator').style.display = 'none';
  };

  return (
    <div className="App">
      <div className="main-container">
          <h1 className="demo-title">Merrco Payfirma iFrame Transaction NPM Module Demo - React</h1>
          <input type="text" className="input-field" placeholder="First Name" />
          <input type="text" className="input-field" placeholder="Last Name" />
          <input type="email" className="input-field" placeholder="Email Address" />
          {/* Step 2. -- Create container div for credit card fields in your payment form. */}
          <div id="easypay-container"></div>
          <button className="pay-button" id="payButton" onClick={handlePaymentClick}>Pay</button>
          <div id="loadingIndicator" className="loader" style={{display: 'none'}}></div>
          <div id="tokenResults" style={{background: 'lightgreen'}} hidden="true">
            <b>Token Result</b>
            <pre id="cardtoken-result" style={{overflowWrap: 'break-word'}}></pre>
          </div>
          <div id="saleResults" style={{background: 'lightgreen'}} hidden="true">
            <b>Sales Request Result</b>
            <pre id="sale-result" style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}></pre>
          </div>
        </div>
    </div>
  );
}

export default App;