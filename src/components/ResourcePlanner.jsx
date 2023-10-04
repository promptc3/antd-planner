import { useState, useRef, useEffect } from "react";
import { Button, Col, Row, Skeleton, Table, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

const { Title } = Typography;
dayjs.extend(customParseFormat);
dayjs.extend(isToday);
dayjs.extend(isBetween);

export function ResourcePlanner(props) {
  // console.warn("Event Resource Ref", eventResourceRef);
  const { dataSource, blockedDates, plannerViewDate } = props;
  const [scrolledToToday, setScrolledToToday] = useState(false);
  const [columns, setColumns] = useState([
    {
      title: "Name",
      dataIndex: "name",
      width: 100,
      key: "name",
      fixed: "left",
    },
  ]);
  const [ activeDate, setActiveDate ] = useState(dayjs(plannerViewDate, "DD MM YYYY"));
  const [ activeView, setActiveView ] = useState('month');
  const targetElementRef = useRef(null);
  const ColumnTitle = ({day}) => {
    // if day is today add ref scroll to else just add return div
    let colTitle = "";
    if (activeView === "month") {
        colTitle = day.isToday() ?
        <div ref={targetElementRef}>{day.format("ddd, DD")}</div>
        : <div>{day.format("ddd, DD")}</div>
    } else if (activeView === "week") {
        colTitle = day.isToday() ?
        <div ref={targetElementRef}><Row>{day.format("dddd")}</Row><Row justify={"center"}>{day.format("DD")}</Row></div>
        : <div ><Row>{day.format("dddd")}</Row><Row justify={"center"}>{day.format("DD")}</Row></div>
    } else if ( activeView === "day") {
        colTitle = day.isToday() ?
        <div ref={targetElementRef}>{day.format("hh:mm A")}</div>
        : <div>{day.format("hh:mm A")}</div>
    } else {
        colTitle = day.isToday() ?
        <div ref={targetElementRef}>{day.format("DD-MM-YYYY")}</div>
        : <div>{day.format("DD-MM-YYYY")}</div>
    }
    // console.log("Title",colTitle);
    return colTitle;
  };
  const handleDoubleClick = (record, clickedDate) => {
    // create a new Event object
    // console.warn("Entity (In handle doubleclick)", getCreateObject());
    console.warn(
      `Data in double click - date: ${clickedDate} record - ${record}`
    );
  };
  const tagTextStyle = {
    maxWidth: "17ch",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };
  const Events = function ({ eventArray }) {
    if (eventArray !== undefined) {
      // console.log("Event array", eventArray);
      const list = eventArray.map((element) => {
        return (
          <Tooltip key={element.key} placement="bottom" title={element.title}>
            <Tag key={element.key} style={tagTextStyle} color={element.color}>
              {" "}
              {element.title}{" "}
            </Tag>
          </Tooltip>
        );
      });
      return list;
    } else return <div></div>;
  };
  const eventListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  };

  const getColumnClass = (date) => {
    const classNames = [];
    blockedDates.forEach(element => {
      const currentDay = dayjs(element, "DD-MM-YYYY");
      dayjs(date).isSame(currentDay.format("YYYY-MM-DD"), 'day') ? classNames.push("blocked") : "";
    });
    dayjs(date).isToday() && activeView !== "day" ? classNames.push("today") : "";
    const startTime = date.subtract(1, "hour");
    const endTime = date.add(1, "hour");
    // console.log(`ST: ${startTime} ET: ${endTime}`);
    dayjs().isBetween(startTime, endTime, "hours" ) && activeView === "day" ? classNames.push("now") : "";
    return classNames.join(" ");
  }

  const handleMouseOver = (currentDay, event) => {
    const dayValue = dayjs(currentDay, 'DD-MM-YYYY');
    getColumnClass(dayValue).split(" ").forEach(element => {
      const tempClassname = element ? element+"-hover" : " ";
      try {
        if (element) {
          event.target.classList.add(element, tempClassname);
        }
        // console.log("Element contains ", event.target.classList.contains(tempClassname));
      } catch (error) {
        console.error("Error while hovering", error); 
      }
      // event.target.classList.add(`${element}-hover`);
    });
  }

  const createColumns = (dateString) => {
    const startDate = dateString
      ? dayjs(dateString).startOf(activeView)
      : dayjs().startOf(activeView);
    const endDate = dateString
      ? dayjs(dateString).endOf(activeView)
      : dayjs().endOf(activeView);
    let currentDay = startDate;
    let index = 1;
    const dateColumns = [];
    while (currentDay <= endDate) {
      const colTitle = `${currentDay.format("DD-MM-YYYY")}`;
      dateColumns.push({
        title: <ColumnTitle day={currentDay}></ColumnTitle>,
        className: getColumnClass(currentDay),
        dataIndex: colTitle,
        key: `${currentDay.format("DDMMYYYHHMMSS")}`,
        onCell: (record, _rowIndex) => ({
          onDoubleClick: () => {
            // console.warn("Double Click", _rowIndex);
            handleDoubleClick(record, currentDay.toDate());
          },
          onMouseOver : event => {
            handleMouseOver(colTitle, event);
          }
        }),
        render: (_, record) => (
          <div style={eventListStyle}>
            <Events eventArray={record[colTitle]} />
          </div>
        ),
      });
      if (activeView === "day") {
        currentDay = startDate.add(index, "hour");
      } else {
        currentDay = startDate.add(index, "day");
      }
      index++;
    }
    return dateColumns;
  };
  const scrollToElement = (element) => {
    if (element) {
      element.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  };

  const scrollToToday = () => {
    // console.warn("Ref", targetElementRef.current);
    scrollToElement(targetElementRef.current);
  };

  const viewPrevious = () => {
    setActiveDate(dayjs(activeDate).subtract(1, activeView));
  };

  const viewNext = () => {
    setActiveDate(dayjs(activeDate).add(1, activeView));
  };

  const getPlannerTitle = () => {
    if (activeView === "month") {
        return dayjs(activeDate).format(' MMMM-YYYY ');
    } else if (activeView === "week") {
        return dayjs(activeDate).startOf("week").format('DD-MMM to').concat(
        dayjs(activeDate).endOf("week").format(' DD-MMM, YYYY')
        )
    } else {
        return dayjs(activeDate).format(' DD MMMM YYYY ');
    }
  };
  const monthView = () => {
    setActiveView('month');
  }
  const weekView = () => {
    setActiveView('week');
  }
  const dayView = () => {
    setActiveView('day');
  }
  useEffect(() => {
    setColumns([
      {
        title: "Name",
        dataIndex: "name",
        width: 100,
        key: "name",
        fixed: "left",
      },
      ...createColumns(dayjs(activeDate)),
    ]);
    if (!scrolledToToday && targetElementRef.current !== null) {
      scrollToToday();
      setScrolledToToday(true);
    } else {
      setScrolledToToday(false);
    }
  }, [activeView, plannerViewDate, activeDate, blockedDates]);
  if (!dataSource || dataSource.length === 0) {
    // console.error("Datasource not received", dataSource);
    return <Skeleton active />;
  } else {
    return (
      <div className="planner">
        {/* <Button onClick={scrollToToday}>Today</Button> */}
        <Row style={{ marginBottom: "3px", maxWidth: "100%" }}>
            <Col span={8}>
                <Row justify={"start"}>
                <Button onClick={viewPrevious}>Previous</Button>
                <Button onClick={scrollToToday}>Today</Button>
                <Button onClick={viewNext}>Next</Button>
                </Row>
            </Col>
            <Col style={{ textAlign: "center" }} span={8}>
                <Title level={5}>{getPlannerTitle()}</Title>
            </Col>
            <Col span={8}>
                <Row justify={"end"}>
                <Button onClick={monthView}>Month</Button>
                <Button onClick={weekView}>Week</Button>
                <Button onClick={dayView}>Day</Button>
                </Row>
            </Col>
        </Row>
        <Row>
        <Table
            dataSource={dataSource}
            columns={columns}
            style={{ maxWidth: "90vw" }}
            scroll={{ x: "max-content" }}
            pagination={false}
            bordered
        />
        </Row>
      </div>
    );
  }
}
