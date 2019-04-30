import React, { Component } from 'react'; 
import {Doughnut} from 'react-chartjs-2'; 
import IncomeExpenseList from '../IncomeExpenseList';
import './DashboardPage.css';
import config from '../../config'
import TokenService from '../../services/token-service'
import DataContext from '../../contexts/DataContext';
import { getAllCategories } from '../../services/categories-service';
import { getMonthlyReport } from '../../services/reports-service';


export default class DashboardPage extends Component {
  static contextType = DataContext;

  state = {
    categoryColors: {
      0: '#f04511',
      1: '#5501d0',
      2: '#ff01fa',
      3: '#508fe4',
      4: '#0fa931',
    },
    chart: {
      data: {
        labels: [],
        datasets: [
          {
            label: "Total Expenses",
            backgroundColor: [],
            data: [],
          }
        ],
      },
      options: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 30,
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    },
    incomes: [], 
    expenses: [] 
  }

  componentDidMount() {
    getAllCategories()
      .then(categories => {
        this.setState({categories});
        this.handleReports(2019, 4)
      })
  }

  updateChart = () => {
    let chart = this.state.chart;
    let data = [];
    let labels = [];
    let backgroundColor = [];

    console.log(this.state.expenses);

    // this is why the chart doesnt render the data properly
    this.state.expenses.forEach(item => {
      data.push(parseInt(item.amount));
      labels.push(this.state.categories.find(c => c.id === item.category_id).name);
      backgroundColor.push(this.state.categoryColors[item.category_id] || this.state.categoryColors[0]);
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = backgroundColor;

    this.setState({chart});
  }

  handleReports = (year, month) => {
    year = parseInt(year);
    month = parseInt(month);

    // set defaults if inputs are invalid
    if(isNaN(year) || isNaN(month)) {
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
    }

    getMonthlyReport(year, month)
      .then(report => {
        this.setState({incomes: report.incomes, expenses: report.expenses});
        this.updateChart();
      })
  }

  render() {
    return (
      <main className="flex-main">
        <section className="page-controls">
          <select className="select-month">
            <option>April 2019</option>
          </select>
        </section>

        <div className="w-100"></div>

        <section className="page-chart">
          <Doughnut data={this.state.chart.data} options={this.state.chart.options} />
        </section>

        <section className="page-summaries">
          <IncomeExpenseList type="income" data={this.state.incomes} onlyShowRecent />
          <IncomeExpenseList type="expenses" data={this.state.expenses} onlyShowRecent />
        </section>
      </main>
    );
  }
}