import React from 'react';
import { useState } from 'react';
import "./App.scss";

import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBCollapse,
  MDBValidation,
  MDBValidationItem,
  MDBInput,
} from 'mdb-react-ui-kit';

function App() {
  const [showBasic, setShowBasic] = useState(false);
  const [formValue, setFormValue] = useState({
    price: 10000,
    tenure: 5,
    discount: 500,
    processing_fees: 199


  });
  const onChange = (e) => {
    setFormValue({ formValue, [e.target.name]: e.target.value });
  };


  let piechart_data = [89.999, 9500.00, 499.999, 234.82];
  const [piedata, setPiedata] = useState(piechart_data);
  function calculateIRR(values, guess) {
    // values: an array of cash flows (positive or negative)
    // guess: an initial guess for the IRR

    var tolerance = 0.00001;
    var maxIterations = 1000;
    var iteration = 0;
    var result = guess;

    do {
      var NPV = 0;
      var dNPV = 0;

      for (var i = 0; i < values.length; i++) {
        NPV += values[i] / Math.pow(1 + result, i);
        dNPV -= values[i] * i / Math.pow(1 + result, i + 1);
      }

      var newResult = result - NPV / dNPV;
      var error = Math.abs(newResult - result);

      result = newResult;
      iteration++;

    } while (error > tolerance && iteration < maxIterations);

    if (iteration === maxIterations) {
      throw new Error("IRR calculation failed: maximum iterations reached.");
    }

    return result;
  }

  function rate(nper, pmt, pv, fv, type, guess) {

    // Sets default values for missing parameters
    fv = typeof fv !== 'undefined' ? fv : 0;
    type = typeof type !== 'undefined' ? type : 0;
    guess = typeof guess !== 'undefined' ? guess : 0.1;

    // Sets the limits for possible guesses to any
    // number between 0% and 100%
    var lowLimit = 0;
    var highLimit = 1;

    // Defines a tolerance of up to +/- 0.00005% of pmt, to accept
    // the solution as valid.
    var tolerance = Math.abs(0.00000005 * pmt);

    // Tries at most 40 times to find a solution within the tolerance.
    for (var i = 0; i < 40; i++) {
      // Resets the balance to the original pv.
      var balance = pv;

      // Calculates the balance at the end of the loan, based
      // on loan conditions.
      for (var j = 0; j < nper; j++) {
        if (type === 0) {
          // Interests applied before payment
          balance = balance * (1 + guess) + pmt;
        } else {
          // Payments applied before insterests
          balance = (balance + pmt) * (1 + guess);
        }
      }

      // Returns the guess if balance is within tolerance.  If not, adjusts
      // the limits and starts with a new guess.
      if (Math.abs(balance + fv) < tolerance) {
        return guess * 100;

      } else if (balance + fv > 0) {
        //console.log("stuck in else if")

        // Sets a new highLimit knowing that
        // the current guess was too big.
        highLimit = guess;
      } else {
        //console.log("stuck in else")
        // Sets a new lowLimit knowing that
        // the current guess was too small.
        lowLimit = guess;
      }

      // Calculates the new guess.
      guess = (highLimit + lowLimit) / 2;
    }
  }


  function ammortization(initial_loan_amount, price_of_the_item, tenure, rate_of_interest, gst, processing_fees) {
    var a = document.getElementById("amortization_tbody");
    var len = a.rows.length;
    for (var x = 1; x < len; x++) {
      a.deleteRow(1);
    }
    console.log(len);

    const ammortization_table_body = document.getElementById("amortization_tbody");
    const emi_for_ammortization = price_of_the_item / tenure;
    var cur_loan_amount = initial_loan_amount;
    var total_amount_to_paid_at_the_end = 0;
    var principle_sum = 0;
    var total_gst = 0;
    var interest_sum = 0;
    var CF = [];
    CF.push(price_of_the_item);

    // for populating the ammortization table
    for (var month = 1; month <= tenure; month++) {
      var row = ammortization_table_body.insertRow();
      var interest_paid = cur_loan_amount * (rate_of_interest / 1200);
      var principle_repaid = emi_for_ammortization - interest_paid;
      var gst_on_interest = interest_paid * gst;
      var total_emi = emi_for_ammortization + gst_on_interest;
      if (month === 1) {
        total_emi += processing_fees * 1.18;
      }
      CF.push(-total_emi.toFixed(2));
      row.insertCell().append(month);
      row.insertCell().append(cur_loan_amount.toFixed(2));
      row.insertCell().append(principle_repaid.toFixed(2));
      row.insertCell().append(interest_paid.toFixed(2));
      row.insertCell().append(gst_on_interest.toFixed(2));
      if (month === 1) {
        row.insertCell().append((processing_fees * 1.18).toFixed(2));
      }
      else {
        row.insertCell().append("-");
      }
      row.insertCell().append(total_emi.toFixed(2));

      cur_loan_amount -= principle_repaid;
      total_amount_to_paid_at_the_end += total_emi;
      total_gst += gst_on_interest;
      principle_sum += principle_repaid;
      interest_sum += interest_paid;
    }
    let changedPiechartdata = [total_gst.toFixed(2), principle_sum.toFixed(2), interest_sum.toFixed(2), (processing_fees * 1.18).toFixed(2)];
    setPiedata(changedPiechartdata);
    var irr = calculateIRR(CF, 0.1) * 12;
    if (irr == "-Infinity") {
      irr = 0;
    }
    var total_interest_at_the_end = total_amount_to_paid_at_the_end - initial_loan_amount;
    document.getElementById("total_cost").innerHTML = ("Total amount to be paid by you during the tenure is " + "<span id='to_emphasize_total_amount' class='fs-2 font-monospace'>" + total_amount_to_paid_at_the_end.toFixed(2) + "</span>" + ", the total interest paid druing the tenure is "
      + "<span id='to_emphasize_total_interest' class='fs-2 font-monospace'>" + total_interest_at_the_end.toFixed(2) + "</span>" + "<br>" + " with rate of return received by the bank is " + "<span id='irr_emphasize' class='fs-2 font-monospace'>" + (irr * 100).toFixed(2) + "%" + "</span>");
    console.log(piechart_data);
  }

  const calculate = () => {
    //inputs
    const price_of_the_item = document.getElementById("validationCustom01").value;
    const no_cost_emi_discount = document.getElementById("validationCustom03").value;
    const tenure = document.getElementById("validationCustom02").value;
    const processing_fees = document.getElementById("validationCustom04").value;

    // Processing

    var emi = price_of_the_item / tenure;
    var initial_loan_amount = price_of_the_item - no_cost_emi_discount;
    var rate_of_interest = rate(tenure, -emi, initial_loan_amount) * 12;
    const gst = 0.18;
    ammortization(initial_loan_amount, price_of_the_item, tenure, rate_of_interest, gst, processing_fees);
  }



  return (
    <html>
      <body>
        <div id="header">
          <MDBNavbar expand='lg' light bgColor='light'>
            <MDBContainer fluid>
              <MDBNavbarBrand href='#'>Calc</MDBNavbarBrand>

              <MDBNavbarToggler
                aria-controls='navbarSupportedContent'
                aria-expanded='false'
                aria-label='Toggle navigation'
                onClick={() => setShowBasic(!showBasic)}
              >
                <MDBIcon icon='bars' fas />
              </MDBNavbarToggler>

              <MDBCollapse navbar show={showBasic}>
                <MDBNavbarNav className='mr-auto mb-2 mb-lg-0'>
                  <MDBNavbarItem>
                    <MDBNavbarLink active aria-current='page' href='#'>
                      NCE-Calc
                    </MDBNavbarLink>
                  </MDBNavbarItem>
                </MDBNavbarNav>
              </MDBCollapse>
            </MDBContainer>
          </MDBNavbar>
        </div>
        <br></br>
        <p id="introduction">
          Now you can easily calculate the actual amount you will paying when you opt for a  <span class="fw-light">NO COST EMI </span>scheme.
        </p>
        <div id="content_input" class="pb-4">
          <div id="input_field" class="bg-white border rounded-5">
            <MDBValidation className='row g-3' class="w-100 p-4 pb-4">
              {/* to make content stay  inline class="d-flex justify-content-evenly align-items-center" */}
              <div class="row g-3 needs validation" novalidate>
                <MDBValidationItem class="col-md-4">
                  <div class="form-outline">
                    <MDBInput
                      value={formValue.price}
                      name='price'
                      onChange={onChange}
                      id='validationCustom01'
                      required
                      label='Price of the item'
                      size='sm'
                      class="form-control active"
                    />
                  </div>
                </MDBValidationItem><br></br>
                <MDBValidationItem className='col-md-4'>
                  <div class="form-outline">
                    <MDBInput
                      value={formValue.tenure}
                      name='tenure'
                      onChange={onChange}
                      id='validationCustom02'
                      required
                      label='Tenure of EMI'
                      size='sm'
                    />
                  </div>
                </MDBValidationItem><br></br>
                <MDBValidationItem className='col-md-4'>
                  <div class="form-outline">
                    <MDBInput
                      value={formValue.discount}
                      name='discount'
                      onChange={onChange}
                      id='validationCustom03'
                      required
                      label='Discount Offered'
                      size='sm'
                    />
                  </div>
                </MDBValidationItem><br></br>
                <MDBValidationItem className='col-md-4'>
                  <div class="form-outline">
                    <MDBInput
                      value={formValue.processing_fees}
                      name='processing_fees'
                      onChange={onChange}
                      id='validationCustom04'
                      required
                      label='Processing Fees'
                      size='sm'
                    />
                  </div>
                </MDBValidationItem>
              </div>
            </MDBValidation>
          </div>
          {/* <button class="btn btn-secondary" onClick={calculate}>Calculate</button><br></br> */}
          <div class="col-12">
            <button class="btn btn-primary" type="submit" onClick={calculate}>Calculate</button>
          </div>
        </div>
        <div id="content_output">
          <p id="total_cost" class="fw-light">Total amount to be paid by you during the tenure is <span id="to_emphasize_total_amount" class="fs-2 font-monospace">10324.82</span>,
            the total interest paid druing the tenure is <span id="to_emphasize_total_interest" class="fs-2 font-monospace">824.2</span> <br></br>with rate of return received by the bank is <span id="irr_emphasize" class="fs-2 font-monospace">13.13%</span>.
          </p>
          <p id="cash_flow_heading">
            Below you can see the cash flow and its detials.
          </p>
        </div>
        <div id="amortization_table" class="table-container">
          {/* <table responsive id="amortization_tbody" class="table-responsive table table-sm table-bordered table-hover "> */}
          <table responsive size="sm" class="table table-bordered" id="amortization_tbody">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Beginning Balance</th>
                <th scope="col">Principle Repaid</th>
                <th scope="col">Interest Paid</th>
                <th scope="col">GST on Interest</th>
                <th scope="col">Processing Fees</th>
                <th scope="col">Total EMI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>9500.00</td>
                <td>1835.22</td>
                <td>164.78</td>
                <td>29.66</td>
                <td>234.82</td>
                <td>2264.48</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>7664.78</td>
                <td>1867.05</td>
                <td>132.95</td>
                <td>23.93</td>
                <td>-</td>
                <td>2023.93</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>5797.72</td>
                <td>1899.44</td>
                <td>100.56</td>
                <td>18.10</td>
                <td>-</td>
                <td>2018.10</td>
              </tr>
              <tr>
                <th scope='row'>4</th>
                <td>3898.29</td>
                <td>1932.38</td>
                <td>67.62</td>
                <td>12.17</td>
                <td>-</td>
                <td>2012.17</td>
              </tr>
              <tr>
                <th scope='row'>5</th>
                <td>1965.90</td>
                <td>1965.90</td>
                <td>34.10</td>
                <td>6.14</td>
                <td>-</td>
                <td>2006.14</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body >
    </html >
  );
}

export default App;