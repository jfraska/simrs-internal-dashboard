import request from "utils/request";

export function getRetur(params) {
  return request({
    url: `${process.env.NEXT_PUBLIC_GATEWAY_BASE_URL}/retur`,
    method: "GET",
    params,
  });
}

export function getDetailRetur(params) {
  return request({
    url: `${process.env.NEXT_PUBLIC_GATEWAY_BASE_URL}/retur/show`,
    method: "GET",
    params,
  });
}

export function createRetur(data) {
  return request({
    url: `${process.env.NEXT_PUBLIC_GATEWAY_BASE_URL}/retur`,
    method: "POST",
    data,
  });
}
