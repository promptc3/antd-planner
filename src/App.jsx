import { useState } from "react";
import { Layout, Typography, DatePicker, Space } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
const { Header, Footer, Content } = Layout;
const { Title } = Typography;
import "./App.css";
import { ResourcePlanner } from "./components/ResourcePlanner";

function App() {
  const [activeDate, setActiveDate] = useState(null);
  dayjs.extend(customParseFormat);
  const handleOnChange = (time) => {
    setActiveDate(dayjs(time).format('DD MM YYYY'));
  };
  const dataSource = [
      {
          key: '1223',
          name: "Kevin",
          "12-09-2023": [{key: "5678", title: "Some Event", color: "lightgreen"}],
      },
      {
          key: '1234',
          name: "Samuel",
          "21-09-2023": [{key: "1234", title: "Yet Another Event", color: "lightblue"},
                         {key: "1231", title: "Another Event", color: "lightblue"}],
      },
  ];
  const blockedDates = ["10-09-2023", "09-09-2023", "28-09-2023"];
  return (
    <>
      <Layout>
        <Header>
            <div className="app-title">
              <Title level={2} type="secondary">Scheduler</Title>
            </div>
        </Header>
        <Content>
          <div className="app-content">
            <DatePicker onChange={handleOnChange} defaultValue={dayjs()}/>
            <ResourcePlanner dataSource={dataSource} blockedDates={blockedDates} plannerViewDate={activeDate ? activeDate : dayjs().format("DD MM YYYY") }/>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Resource Planner Application ©2023 Created by Saumyajeet.</Footer>
      </Layout>
    </>
  );
}

export default App;
