type LocationContext = {
  id: string;
  mapbox_id: string;
  short_code: string;
  text: string;
  wikidata: string;
};

type LocationGeometry = { coordinates: number[]; type: string };

export type LocationFeature = {
  id: string;
  bbox: number[];
  center: number[];
  context: LocationContext[];
  geometry: LocationGeometry;
  matching_place_name: string;
  matching_text: string;
  place_name: string;
  place_type: string[];
  properties: { mapbox_id: string; wikidata: string };
  relevance: number;
  text: string;
  type: string;
};

export type LocationQueryResponse = {
  attribution: string;
  features?: LocationFeature[];
  query: string[];
  type: string;
};
