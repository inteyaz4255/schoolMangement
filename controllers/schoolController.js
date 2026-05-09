const db = require("../config/db");


// Add School API
const addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validation
  if (
    !name ||
    !address ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return res.status(400).json({
      success: false,
      message: "Latitude and Longitude must be numbers",
    });
  }

  const sql =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [name, address, latitude, longitude],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "School added successfully",
        schoolId: result.insertId,
      });
    }
  );
};


// Distance Formula Function
function calculateDistance(lat1, lon1, lat2, lon2) {

  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371;

  const dLat = toRad(lat2 - lat1);

  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


// List Schools API
const listSchools = (req, res) => {

  const userLat = parseFloat(req.query.latitude);

  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({
      success: false,
      message: "Valid latitude and longitude required",
    });
  }

  const sql = "SELECT * FROM schools";

  db.query(sql, (err, schools) => {

    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    const sortedSchools = schools.map((school) => {

      const distance = calculateDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude
      );

      return {
        ...school,
        distance: distance.toFixed(2) + " km",
      };

    }).sort((a, b) => {

      return parseFloat(a.distance) - parseFloat(b.distance);

    });

    res.status(200).json({
      success: true,
      schools: sortedSchools,
    });

  });

};

module.exports = {
  addSchool,
  listSchools,
};