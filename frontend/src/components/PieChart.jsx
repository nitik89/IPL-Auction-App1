import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box, Text } from "@chakra-ui/react";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#FF9F40", "#4BC0C0"];

const PurseAnalyticsByRole = ({ team }) => {
  const [data, setData] = useState([]);
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
  console.log("data", data);
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <Box textAlign="center" mt={6}>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          nameKey="name"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `${value.toFixed(2)} CR`} // Format value as crores (CR)
        />
        <Legend />
      </PieChart>
    </Box>
  );
};

export default PurseAnalyticsByRole;
