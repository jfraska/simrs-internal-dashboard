import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderOnLayout from "components/LoaderOnLayout";
import { getDetailPembelian } from "api/gudang/pembelian";
import TableLayout from "pages/pasien/TableLayout";
import { formatReadable } from "utils/formatTime";
import BackIcon from "@material-ui/icons/ArrowBack";
import {
  Grid,
  Card,
  Avatar,
  Typography,
  Divider,
  Button,
  Dialog,
} from "@mui/material";
import { Paper } from "@material-ui/core";
import useClientPermission from "custom-hooks/useClientPermission";
import TableLayoutDetail from "components/TableLayoutDetailGudang";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import FormPembelian from "components/modules/gudang/formPembelian";

const Detail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { isActionPermitted } = useClientPermission();
  const [dialogFormState, setDialogFormState] = useState(false);

  // const [dataPembelian, setDataPembelian] = useState({});
  const [detailDataPembelian, setDetailDataPembelian] = useState([]);
  const [dataPembelian, setDataPembelian] = useState({});
  const [isLoadingDataPembelian, setIsLoadingDataPembelian] = useState(true);

  const detailPembelianTableHead = [
    {
      id: "kode_item",
      label: "Kode Item",
    },
    {
      id: "nama_item",
      label: "Nama Item",
    },
    {
      id: "nomor_batch",
      label: "Nomor Batch",
    },
    {
      id: "jumlah",
      label: "Jumlah",
    },
    {
      id: "sediaan",
      label: "Sediaan",
    },
    {
      id: "harga_beli_satuan",
      label: "Harga Beli",
    },
    {
      id: "harga_jual_satuan",
      label: "Harga Jual",
    },
    {
      id: "diskon",
      label: "Diskon",
    },
    {
      id: "margin",
      label: "Margin",
    },
    {
      id: "total",
      label: "Total",
    },
    {
      id: "tanggal_ed",
      label: "Expired Date",
    },
  ];

  const dataDetailFormatHandler = (payload) => {
    const result = payload.map((e) => {
      return {
        kode_item: e.item.kode || "null",
        nama_item: e.item.name || "null",
        nomor_batch: e.nomor_batch || "null",
        jumlah: e.stok || "null",
        sediaan: e.item.sediaan.name || "null",
        harga_beli_satuan: e.harga_beli_satuan || "null",
        harga_jual_satuan: e.harga_jual_satuan || "null",
        diskon: e.diskon || "null",
        margin: e.margin || "null",
        total: e.total_pembelian || "null",
        tanggal_ed: e.tanggal_ed || "null",
        id: e.id || e,
      };
    });
    return result;
  };

  useEffect(() => {
    if (router.isReady) {
      (async () => {
        try {
          const response = await getDetailPembelian({ id: slug[0] });
          const data = response.data.data;
          data = {
            ...data,
            receive_detail: data.gudang,
          };
          setDataPembelian(data);
          const formattedData = dataDetailFormatHandler(data.gudang); // format data untuk error handling
          setDetailDataPembelian(formattedData);
        } catch (error) {
          console.log("Error fetching data:", error);
        } finally {
          setIsLoadingDataPembelian(false);
        }
      })();
    }
  }, [router.isReady, slug]);

  return (
    <>
      {isLoadingDataPembelian ? (
        <LoaderOnLayout />
      ) : (
        <>
          <Paper>
            <Card className="py-12 mb-16">
              <div className="px-14 flex justify-between items-start">
                <div className="flex items-start">
                  <Avatar
                    src="/icons/receive.png"
                    variant="rounded"
                    sx={{ width: 250, height: 250, marginRight: 2 }}
                  />
                  <div className="ml-8 mt-8">
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">
                          Nomor Faktur
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataPembelian?.nomor_faktur}
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">
                          Nomor Purchase Order
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataPembelian?.purchase_order.nomor_po}
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">
                          Tanggal Pembelian
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {formatReadable(dataPembelian?.tanggal_pembelian)}
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">
                          Jatuh Tempo Pembayaran
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {formatReadable(dataPembelian?.tanggal_jatuh_tempo)}
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">
                          Nama Supplier
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataPembelian?.purchase_order.supplier.name}
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">Telepon</Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataPembelian?.purchase_order.supplier.telp}
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">Alamat</Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataPembelian?.purchase_order.supplier.address}
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h1 font-w-700">PPN</Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataPembelian?.ppn}
                          {"%"}
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-end px-14">
                <Button
                  variant="contained"
                  startIcon={<ModeEditIcon />}
                  sx={{ marginTop: 1 }}
                  disabled={!isActionPermitted("receive:update")}
                  onClick={() => setDialogFormState(true)}
                >
                  Update
                </Button>
              </div>

              <Divider sx={{ borderWidth: "1px", marginTop: 2 }} />

              <TableLayoutDetail
                baseRoutePath={`${router.asPath}`}
                title="Item"
                tableHead={detailPembelianTableHead}
                data={detailDataPembelian}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<BackIcon />}
                  sx={{ marginBottom: 1, marginRight: 2 }}
                  onClick={() => router.push("/gudang/pembelian")}
                >
                  Kembali
                </Button>
              </div>
            </Card>
          </Paper>
          <Dialog
            fullScreen
            open={dialogFormState}
            onClose={() => setDialogFormState(false)}
          >
            <FormPembelian
              isEditType
              prePopulatedDataForm={dataPembelian}
              updatePrePopulatedData={(payload) => {
                setDataPembelian(payload);
                const formattedData = dataDetailFormatHandler(payload.gudang);
                setDetailDataPembelian(formattedData);
              }}
              handleClose={() => setDialogFormState(false)}
            />
          </Dialog>
        </>
      )}
    </>
  );
};

export default Detail;
