// src/components/ExpenditureByRoleBarChart.js

import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  TinyBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Text } from "@chakra-ui/react";

// Colors for BarChart
const BAR_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#FF9F40", "#4BC0C0"];

const ExpenditureByRoleBarChart = ({ team }) => {
  const [data, setData] = useState([]);
  const getPath = (x, y, width, height) => {
    return `M${x},${y + height}C${x + width / 3},${y + height} ${
      x + width / 2
    },${y + height / 3}
    ${x + width / 2}, ${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
      x + width
    }, ${y + height}
    Z`;
  };
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "red"];
  const TriangleBar = (props) => {
    const { fill, x, y, width, height } = props;
    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
  };
  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2} // Position it at the center of the bar
        y={y - 10} // Position the label above the bar
        fill="#fff" // White text color
        textAnchor="middle"
        fontSize={14} // Font size for better visibility
        fontWeight="bold"
      >
        {value} CR
      </text>
    );
  };
  useEffect(() => {
    const myObj = {};
    team?.players?.forEach((player) => {
      if (!myObj[player.role]) {
        myObj[player.role] = 0;
      }
      myObj[player.role] += player.final_price / 10000000;
    });
    myObj["Purse Left"] = team.purse / 10000000;
    setData(
      Object.entries(myObj).map(([name, value]) => ({
        name,
        value,
      }))
    );
  }, [team]);

  return (
    <Box textAlign="center" mt={6}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Bar
          dataKey="value"
          fill="#8884d8"
          shape={<TriangleBar />}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % 5]} />
          ))}
        </Bar>
      </BarChart>
    </Box>
  );
};

export default ExpenditureByRoleBarChart;
