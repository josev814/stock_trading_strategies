import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams, Link } from "react-router";
import axios from 'axios';
import { EditOutlined, DeleteOutline, ArrowBackIosOutlined } from '@mui/icons-material';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";

import ShowRuleTransactionChart from '../components/rules/rule_chart';
import CreateRuleForm from '../components/rules/CreateRule'

export function SHOW_RULE(props) {
    const django_url = props.sitedetails.django_url
    const get_auth_header = props.get_auth_header
    const {rule, rule_name} = useParams()

    const navigate = useNavigate()
    const [loading, setLoading] = useState(null);
    // State to hold the fetched rule data
    const [ruleData, setRuleData] = useState({});
    // State to manage error state
    const [error, setError] = useState(null);
    const [showModal, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    // State to hld the transactions data
    const [transactions, setTransactions] = useState([]);

    function formatTransactions(transactions){
        let formatted = []
        // "id": 175,
        //     "ticker": 10,
        //     "action": "buy",
        //     "quantity": 1,
        //     "price": 168.75,
        //     "timestamp": "2024-04-08T15:32:00"
        let cols = ['id','ticker','action','quantity','price','timestamp']
        
        transactions.forEach(trx => {
            formatted.push(
                [
                    trx.id,
                    trx.ticker,
                    trx.action,
                    trx.quantity,
                    trx.price,
                    trx.timestamp
                ]
            )
        })
        return {'columns': cols, 'records': formatted}
    }

    useEffect(() => {
        if (loading && django_url !== undefined) {
            // Fetch transaction data
            axios.get(`${django_url}/transactions/rule/${rule}/?limit=50`, { headers: get_auth_header() })
                .then(response => {
                    if (response.data.count > 0){
                        // Here, you should set the fetched transaction data
                        let trxs = formatTransactions(response.data.results);
                        setTransactions(trxs);
                    }
                })
                .catch(err => {
                    // Handle any errors that occur during the request
                    setError("Error fetching transaction data:", err)
                });
        }
    }, [loading, django_url, get_auth_header, rule]);


    async function handleDelete() {
        const delete_url = `${props.sitedetails.django_url}/rules/delete/${rule}/`
        try {
            const response = await axios.delete(delete_url, { headers: get_auth_header() });
            switch (response.status) {
                case 204:
                    navigate('/rules/')
                    break;
                case 404:
                    setError('Record not found to delete')
                    break;
                default:
                    break;
            }
        } catch(err){
            setError(err)
        }
    }

    useEffect(() => {
        function showToastError(message) {
            const toastContainer = document.getElementById('toastContainer')
            // Create the toast element
            const toastElement = document.createElement('div');
            toastElement.className = 'toast show'; // Set the class name
            toastElement.setAttribute('role', 'alert');
            toastElement.setAttribute('aria-live', 'assertive');
            toastElement.setAttribute('aria-atomic', 'true');
            toastElement.setAttribute('data-bs-autohide', 'true');
            toastElement.setAttribute('data-bs-delay', 5000);
        
            // Create the inner content of the toast element
            const toastContent = document.createElement('div');
            toastContent.className = 'toast-body bg-danger text-white';
            toastContent.textContent = message;
        
            // Construct the inner HTML content
            const toastHeader = `
                <div class="toast-header">
                    <strong class="me-auto text-danger">Error</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;
        
            // Set the inner HTML content of the toast element
            toastElement.innerHTML = toastHeader;
            toastElement.appendChild(toastContent);
        
            // Append the toast element to the toast container
            toastContainer.appendChild(toastElement);
        }
        if (error){
            console.error('Error: ', error)
            showToastError(error)
        }
    }, [error])

    function GetOperator(operator){
                switch (operator.operator) {
            case 'gt':
                return ('>')
            case 'gte':
                return ('>=')
            case 'lt':
                return ('<')
            case 'lte':
                return ('<=')
            default:
                return ('=')
        }
    }

    function DisplayCondition(content){
        let data = content.content
        return (
            <span>
                <b className='text-info'>{data.condition.toUpperCase()}</b>{' '}
                <b>{data.symbol.ticker.toUpperCase()}</b>{' has '}
                <b>{data.data.toUpperCase()}</b>{' '}
                <b><GetOperator operator={data.operator} /></b>{' '}
                <b>{data.value}</b>
            </span>
        )
    }

    function DisplayAction(content){
        let data = content.content
        return (
            <span>
                <b className='text-danger'>THEN </b>
                <b className='text-primary'>{data.method.toUpperCase()}</b>{' '}
                <b>{data.quantity} {data.quantity_type} </b>{' of '}
                <b>{data.symbol.ticker.toUpperCase()}</b>{' as '}
                <b>{data.order_type}</b>{' order '}
            </span>
        )
    }
    function DisplayTrigger(content){
        let data = content.content
        return (
            <span>
                <b className='text-success'>every {data.interal} </b>
                <b>{data.interval} </b>
                <b>{data.frequency} </b>

            </span>
            
        )
    }

    function DisplaySequence(){
        if(Object.keys(ruleData.record.rule).length > 0){
            return (
                <>
                    {ruleData.record.rule.conditions.map(condition => (
                        <div className='row' key={condition.condition}>
                            <DisplayCondition content={condition} />
                        </div>
                    ))}
                    <DisplayAction content={ruleData.record.rule.action} />
                    <DisplayTrigger content={ruleData.record.rule.trigger} />
                </>
            )
        } else if (ruleData.errors) {
            <div className='row'>
                {ruleData.errors.map(err => (
                    err
                ))}
            </div>
        } else {
            return (
                <div className='row'>
                    No Items Found
                </div>
            );
        }
    }

    function DisplayTransactionColumns(){
        // Check if rule.rule.transactions[0] exists and is an object
        console.log(transactions)
        if (transactions.columns) {
            return (
                <div className='row border border-light border-2'>
                    {transactions.columns.map(column => (
                        <div className='col-md-2' key={column}>
                            <b>{column.toUpperCase()}</b>
                        </div>
                    ))}
                </div>
            );
        } else {
            return null; // Handle case when rule.rule.transactions[0] is not an object
        }
    }

    function DisplayTransactions(){
        if (Object.keys(transactions).length > 0) {
            return (
                transactions.records.map(transaction => (
                    <div className='row border border-light border-1' key={transaction[0]}>
                        <div className='col-md-2'>
                            {transaction[0]}
                        </div>
                        <div className='col-md-2'>
                            {transaction[1]}
                        </div>
                        <div className='col-md-2'>
                            {transaction[2]}
                        </div>
                        <div className='col-md-2'>
                            {transaction[3]}
                        </div>
                        <div className='col-md-2'>
                            {transaction[4]}
                        </div>
                        <div className='col-md-2'>
                            {transaction[5]}
                        </div>
                    </div> 
                ))
            );
        } else {
            return (
                <div className='row'>
                    <h4>No transactions found</h4>
                </div>
            );
        }
    }

    function DisplayBalance(){
        let balance = ruleData.record.balance
        let className = 'text-success'
        if (balance < 0){
            className = 'text-danger'
        }
        return (
            <h4 className={className}>${balance.toFixed(2)}</h4>
        )
    }

    function DisplayStatus(data){
        let status = data.status
        if (status === 0){
            return (
                <span className='text-danger'>Disabled</span>
            )
        }
        return (
            <span className='text-success'>Enabled</span>
        )
    }

    useEffect(() => {
        if (loading && django_url !== undefined) {
            // Rule to fetch the rule information
            async function fetchRuleData(rule) {
                if (django_url === undefined){
                    return
                }
                try {
                    const response = await axios.get(
                        `${django_url}/rules/${rule}/`,
                        {
                            headers: get_auth_header(),
                        }
                    );
                    setRuleData(response.data);
                    localStorage.setItem('user_rule', JSON.stringify(response.data));
                    setLoading(false);
                } catch (err) {
                    setError(err.message); // Handle error appropriately
                    console.log(err);
                }
            }
            fetchRuleData(rule);
        }
        return () => {}
    }, [loading, django_url, get_auth_header, rule]);

    useEffect(() => {
        if (django_url === undefined){
            setLoading(true);
        }
    }, [django_url]);

    // use to set loading to true to invoke other effects
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
        }, 50);
        return () => clearInterval(timer)
    }, [])
    

    if (loading || ruleData === undefined || Object.keys(ruleData).length === 0){
        return (
            <div className="container-fluid">
                <Spinner animation="border" variant="primary" />
            </div>
        )
    }

    return (
        <>
            <div className="container-fluid">
                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Rule {rule_name} ({rule})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this rule?
                    </Modal.Body>
                    <Modal.Footer>
                    <button className='btn btn-secondary' onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        Delete
                    </button>
                    </Modal.Footer>
                </Modal>
                <div className='row'>
                    <div className='col-1'>
                        <button className="btn btn-warning btn-md" onClick={() => navigate(-1)}>
                            <ArrowBackIosOutlined />
                        </button>
                    </div>
                    <div className='col-11'>
                        <h1>{rule_name}</h1>
                    </div>
                </div>
                <div className="row mb-5">
                    <div className="col-md-8">
                        <h3>Investment Balance:</h3>
                        <DisplayBalance />
                    </div>
                    <div className='col-md-4 d-flex justify-content-end'>
                        <div className='col-md-4 d-flex me-3 align-items-center justify-content-end'>
                            <Link to={{ pathname: `/rule/${rule}/${rule_name}/edit` }}>
                                <button className="btn btn-warning btn-md">
                                    <EditOutlined /> Edit
                                </button>
                            </Link>
                        </div>
                        
                        <div className='col-md-4 d-flex align-items-center justify-content-end'>
                            <button className="btn btn-danger btn-md" onClick={handleShow}>
                                <DeleteOutline /> Remove
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row border border-light border-2 shadow-sm mb-5">
                    <h2>Performance</h2>
                    <ShowRuleTransactionChart sitedetails={props.sitedetails} get_auth_header={get_auth_header} />
                    {/* ^ pass symbol and transactions that are loaded from request */}
                </div>
                <div className="row border border-light border-2 shadow-sm mb-5">
                    <div className='col-md-6'>
                        <h4>Rule Information</h4>
                        <div><b>Start:</b> {ruleData.record.start_date}</div>
                        <div><b>Transactions:</b> {Object.keys(transactions).length}</div>
                        <div><b>Growth:</b> {ruleData.record.growth}</div>
                        <div><b>Return:</b> ${ruleData.record.growth}</div>
                        <div><b>Status:</b> <DisplayStatus data={ruleData.record.status} /></div>
                    </div>
                    <div className='col-md-6'>
                        <h4>Sequence</h4>
                        <DisplaySequence />
                    </div>
                </div>
                <div className="row border border-light border-2 shadow-sm mb-5">
                    <div className='container-fluid'>
                        <h2>Last 50 Transactions</h2>
                        <DisplayTransactionColumns />
                        <DisplayTransactions />
                    </div>
                </div>
            </div>
      </>
    )
  };


export function CREATE_RULE(props){    
    return (
        <CreateRuleForm 
            django_url={props.django_url}
            get_auth_header={props.get_auth_header}
        />
    )
}

SHOW_RULE.propTypes = {
    sitedetails: PropTypes.object,
    get_auth_header: PropTypes.func,
};

CREATE_RULE.propTypes = {
    django_url: PropTypes.string,
    get_auth_header: PropTypes.func,
};