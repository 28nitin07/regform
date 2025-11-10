"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline"

const accommodations = [
  { name: "Hotel Super 7", poc: "9991655609", website: "NA", distance: "3.8 km" },
  { name: "Fairvacanze", poc: "8221904142", website: "https://www.fairvacanze.com", distance: "4.8 km" },
  { name: "Leela Grand", poc: "9996754648", website: "NA", distance: "12.7 km" },
  { name: "Antilia by ZION", poc: "7082009131", website: "https://zionhotels.in", distance: "5.1 km" },
  { name: "Cozette Hotel", poc: "7027868806", website: "https://cozettehotel.com", distance: "8.2 km" },
  { name: "SK Park Blu", poc: "1304091200", website: "https://www.parkblu.com", distance: "11.8 km" },
  { name: "TDI CLUB RETREAT", poc: "9873987493", website: "NA", distance: "9 km" },
];

export default function Accommodations() {
  return (
    <div className="h-screen pt-6 pr-6 w-full max-w-[1200px]">
      <div className="mb-8">
        <HeadingWithUnderline
          text="Accommodations"
          desktopSize="md:text-6xl"
          mobileSize="text-3xl sm:text-2xl"
        />
        <p className="text-gray-500 mt-2">
          Explore the list of accommodations available for your stay.
        </p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <HeadingWithUnderline
            text="Hotels in the Route"
            desktopSize="md:text-4xl"
            mobileSize="text-2xl"
          />
        </CardHeader>
        <CardContent className="pt-6">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow>
                <TableHead>Hotel Name</TableHead>
                <TableHead>PoC Number</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Distance from Ashoka</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.map((hotel, index) => (
                <TableRow key={index}>
                  <TableCell>{hotel.name}</TableCell>
                  <TableCell>
                    <a
                      href={`tel:${hotel.poc}`}
                      className="text-blue-500 underline"
                      rel="noopener noreferrer"
                    >
                      {hotel.poc}
                    </a>
                  </TableCell>
                  <TableCell>
                    {hotel.website === "NA" ? (
                      "NA"
                    ) : (
                      <a
                        href={hotel.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {hotel.website}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{hotel.distance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-4">
        <AlertCircle className="w-6 h-6 text-yellow-700" />
        <p className="text-sm text-yellow-700">
          <strong>Please note:</strong> Ashoka Shuttles will operate on a route to and from these hotels.
          If you choose a different accommodation, we will inform you about the nearest point of pickup.
        </p>
      </div>
    </div>
  );
}
