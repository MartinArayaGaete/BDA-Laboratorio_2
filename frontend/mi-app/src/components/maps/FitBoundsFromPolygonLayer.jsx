import { useEffect, useMemo } from "react";
import { useMap } from "../../hooks/useMap.js";

function parseGeometry(value) {
	if (!value) return null;

	try {
		if (typeof value === "string") {
			return parseGeometry(JSON.parse(value));
		}

		if (value.type === "Feature") {
			return parseGeometry(value.geometry);
		}

		if (value.type === "FeatureCollection") {
			return parseGeometry(value.features?.[0]);
		}

		if (value.type === "Polygon" || value.type === "MultiPolygon") {
			return value;
		}
	} catch (error) {
		console.error("Error parsing geometry:", error);
	}

	return null;
}

function collectPoints(geometry) {
	if (!geometry?.coordinates) return [];

	try {
		const rawPoints = geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates.flat(2);

		return rawPoints.filter((point) => {
			if (!Array.isArray(point) || point.length < 2) return false;

			const lng = Number(point[0]);
			const lat = Number(point[1]);

			return Number.isFinite(lng) && Number.isFinite(lat);
		});
	} catch (error) {
		console.error("Error collecting points:", error);
		return [];
	}
}

function getBounds(points) {
	if (!Array.isArray(points) || points.length === 0) return null;

	try {
		const validPoints = points.filter((point) => {
			const lng = Number(point[0]);
			const lat = Number(point[1]);
			return Number.isFinite(lng) && Number.isFinite(lat);
		});

		if (validPoints.length === 0) return null;

		let minLng = Number(validPoints[0][0]);
		let minLat = Number(validPoints[0][1]);
		let maxLng = minLng;
		let maxLat = minLat;

		validPoints.forEach((point) => {
			const lng = Number(point[0]);
			const lat = Number(point[1]);

			minLng = Math.min(minLng, lng);
			minLat = Math.min(minLat, lat);
			maxLng = Math.max(maxLng, lng);
			maxLat = Math.max(maxLat, lat);
		});

		if (!Number.isFinite(minLng) || !Number.isFinite(minLat) || !Number.isFinite(maxLng) || !Number.isFinite(maxLat)) {
			return null;
		}

		return [
			[minLng, minLat],
			[maxLng, maxLat],
		];
	} catch (error) {
		console.error("Error calculating bounds:", error);
		return null;
	}
}

export default function FitBoundsFromPolygonLayer({
	polygon,
	padding = 40,
}) {
	const { map, ready } = useMap();
	const geometryData = polygon;

	const normalizedGeometry = useMemo(() => parseGeometry(geometryData), [geometryData]);

	const bounds = useMemo(() => {
		return normalizedGeometry ? getBounds(collectPoints(normalizedGeometry)) : null;
	}, [normalizedGeometry]);

	useEffect(() => {
		if (!map || !ready || !bounds) return;

		try {
			map.fitBounds(bounds, {
				padding: padding ?? 40,
			});
		} catch (error) {
			console.error("Error fitting bounds:", error);
		}
	}, [bounds, map, padding, ready]);

	return null;
}
