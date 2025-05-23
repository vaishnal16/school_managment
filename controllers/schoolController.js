import db from "../db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDistance } from "../utils/getDistance.js";

const addSchool = asyncHandler(async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
        throw new ApiError(400, "All fields are required or invalid data");
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );

        res.status(201).json(
            new ApiResponse(201, result, "School added successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Database error", [], error.stack);
    }
});

const listSchools=asyncHandler(async(req,res)=>{
    const {latitude,longitude}=req.query;
    if(isNaN(latitude)|| isNaN(longitude)){
        throw new ApiError(400,"Invalid Coordinates")
    }

    try {

        const [schools] = await db.execute('SELECT * FROM schools');
        const sorted = schools
       .map((s) => ({
        ...s,
        distance: getDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          s.latitude,
          s.longitude
        )
       }))
      .sort((a, b) => a.distance - b.distance);

      res.status(200).json(
        new ApiResponse(200,sorted,"School details fetched")
      )


    } catch (error) {
        throw new ApiError(500,error,"Database Error")
    }
})

export {addSchool,listSchools};