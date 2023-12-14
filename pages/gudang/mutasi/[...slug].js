import { useState, useEffect, useRef, forwardRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import LoaderOnLayout from "components/LoaderOnLayout";
import { formatSuratDate } from "utils/formatTime";
import { getDetailMutasi } from "api/gudang/mutasi";
import { formatReadable } from "utils/formatTime";
import BackIcon from "@material-ui/icons/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import {
  Grid,
  Card,
  Avatar,
  Typography,
  Divider,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ReactToPrint from "react-to-print";
import { Paper } from "@material-ui/core";
import TableLayoutDetailGudang from "components/TableLayoutDetailGudang";
import { convertNumberToWords } from "utils/formatNumber";

const detailMutasiTableHead = [
  {
    id: "nomor_batch",
    label: "Nomor Batch",
  },
  {
    id: "kode_item",
    label: "Kode Item",
  },
  {
    id: "nama_item",
    label: "Nama Item",
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
    id: "tanggal_ed",
    label: "Tanggal ED",
  },
];

const dataDetailFormatHandler = (payload) => {
  const result = payload.map((e) => {
    return {
      nomor_batch: e.gudang.nomor_batch || "null",
      kode_item: e.item.kode || "null",
      nama_item: e.item.name || "null",
      jumlah: e.jumlah || "null",
      sediaan: e.item.sediaan.name || "null",
      tanggal_ed: e.gudang.tanggal_ed || "null",
      id: e.id,
    };
  });
  return result;
};

const GeneralConsentToPrint = forwardRef(function GeneralConsentToPrint(
  { data, dataDetail },
  ref
) {
  return (
    <div ref={ref} className="printableContent">
      <div className="m-8" style={{ color: "black" }}>
        <div className="full-width">
          <div className="flex">
            <div
              className="p-10 flex justify-center items-center"
              style={{ width: "20%" }}
            >
              <Image
                src="/icons/logo.png"
                width={120}
                height={120}
                alt="rsmp"
              />
            </div>
            <div className="p-12" style={{ width: "100%" }}>
              <div className="font-w-600">
                <div className="font-30">RSU MITRA PARAMEDIKA</div>
                <div className="font-20" style={{ color: "gray" }}>
                  Jln. Raya Ngemplak, Kemasan Widodomartani, Ngemplak, Sleman
                  55584 Telp. (0274) 4461098
                </div>
              </div>
            </div>
          </div>
          <Divider sx={{ borderWidth: "1px", borderColor: "black" }} />
          <div
            className="py-12 font-w-700 font-22"
            style={{ textAlign: "center", textDecoration: "underline" }}
          >
            FORM PERMINTAAN OBAT / ALKES
          </div>
          <div className="flex mb-30 mt-12" style={{ flexDirection: "column" }}>
            <div className="flex">
              <div className="pl-8" style={{ flex: 0.8 }}>
                No. Mutasi
              </div>
              <div style={{ flex: 6.2 }}>: {data?.nomor_mutasi}</div>
            </div>
            <div className="flex">
              <div className="pl-8" style={{ flex: 0.8 }}>
                Tanggal
              </div>
              <div style={{ flex: 6.2 }}>
                : {formatSuratDate(data?.tanggal_mutasi)}
              </div>
            </div>
            <div className="flex">
              <div className="pl-8" style={{ flex: 0.8 }}>
                Unit
              </div>
              <div style={{ flex: 6.2 }}>: {data?.unit.name}</div>
            </div>
          </div>
          <div className="mt-10 py-4 pl-8">Mohon disediakan :</div>
          <div className="p-10">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>No</TableCell>
                    {/* <TableCell sx={{fontWeight: 'bold'}}>Kode Obat/Item</TableCell> */}
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Nama Obat / Item
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Jumlah Permintaan
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Jumlah Penyiapan
                    </TableCell>
                    {/* <TableCell sx={{fontWeight: 'bold'}}>
                      Keterangan
                    </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataDetail.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      {/* <TableCell>{row.kode_item}</TableCell> */}
                      <TableCell>{row.nama_item}</TableCell>
                      <TableCell>
                        {row.jumlah}
                        {" ("}
                        {convertNumberToWords(row.jumlah)}
                        {")"}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div className="flex">
            <div className="py-8" style={{ flex: 1 }}></div>
            <div className="py-8 pl-8 flex" style={{ flex: 1 }}>
              {/* <div style={{flex: 1, textAlign: 'center'}}>
                Sleman, {formatSuratDate(dataMutasi?.tanggal_po)}
              </div> */}
            </div>
          </div>
          <div className="flex mt-30">
            <div className="py-8" style={{ flex: 1 }}>
              <div style={{ textAlign: "center" }}>Penerima Barang,</div>
              <div style={{ height: "120px" }}></div>
              <div className="px-40">
                <div style={{ textAlign: "center" }}></div>
                <div style={{ borderBottom: "1px dotted black" }}></div>
                <div style={{ textAlign: "center" }}></div>
              </div>
            </div>
            <div className="py-8" style={{ flex: 1 }}>
              <div style={{ textAlign: "center" }}>Penyedia Barang,</div>
              <div style={{ height: "120px" }}></div>
              <div className="px-40">
                <div style={{ textAlign: "center" }}></div>
                <div style={{ borderBottom: "1px dotted black" }}></div>
                <div style={{ textAlign: "center" }}></div>
              </div>
            </div>
            <div className="py-8" style={{ flex: 1 }}>
              <div style={{ textAlign: "center" }}>Peminta Barang,</div>
              <div style={{ height: "120px" }}></div>
              <div className="px-40">
                <div style={{ textAlign: "center" }}></div>
                <div style={{ borderBottom: "1px dotted black" }}></div>
                {/* <div style={{borderBottom: '1px solid black'}}></div> */}
                <div style={{ textAlign: "left" }}>NIP.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const DetailMutation = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [detailDataMutasi, setDetailDataMutasi] = useState({});
  const [dataMutasi, setDataMutasi] = useState({});
  const [isLoadingDataMutasi, setIsLoadingDataMutasi] = useState(true);
  const generalConsentPrintRef = useRef();

  const GeneralConsent = (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginRight: "20px",
        marginTop: "20px",
      }}
    >
      <ReactToPrint
        trigger={() => (
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{ marginTop: 1 }}
            // disabled={!isPermitted('store')}
            // onClick={() => btnAddHandler(true)}
          >
            Cetak
          </Button>
        )}
        content={() => generalConsentPrintRef.current}
      />
      <GeneralConsentToPrint
        data={dataMutasi}
        dataDetail={detailDataMutasi}
        ref={generalConsentPrintRef}
      />
    </div>
  );

  useEffect(() => {
    if (router.isReady) {
      (async () => {
        try {
          const response = await getDetailMutasi({ id: slug[0] });
          const data = response.data.data;
          const formattedData = dataDetailFormatHandler(data.mutation_detail); // format data untuk error handling
          setDataMutasi(data);
          setDetailDataMutasi(formattedData); // setDataPO pakai data yang diformat di atas
          console.log("Fetched Data:", data);
        } catch (error) {
          console.log("Error fetching data:", error);
        } finally {
          setIsLoadingDataMutasi(false);
        }
      })();
    }
  }, [router.isReady, slug]);

  return (
    <>
      {isLoadingDataMutasi ? (
        <LoaderOnLayout />
      ) : (
        <>
          <Paper>
            <Card className="py-12 mb-16">
              <div className="px-14 flex justify-between items-start">
                <div className="flex items-start">
                  <Avatar
                    src="/icons/mutation.png"
                    variant="rounded"
                    sx={{ width: 250, height: 250, marginRight: 2 }}
                  />
                  <div className="ml-8 mt-8">
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="h1 font-w-700">
                          Nomor Mutasi
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataMutasi?.nomor_mutasi}
                        </div>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="h1 font-w-700">
                          Tanggal Permintaan
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {formatReadable(dataMutasi?.tanggal_permintaan)}
                        </div>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="h1 font-w-700">
                          Tanggal Mutasi
                        </Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {formatReadable(dataMutasi?.tanggal_mutasi)}
                        </div>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="h1 font-w-700">Unit</Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataMutasi?.unit.name}
                        </div>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="h1 font-w-700">Gudang</Typography>
                      </Grid>
                      <Grid item md={7} sm={12}>
                        <div>
                          {" : "}
                          {dataMutasi?.gudang}
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </div>

              {GeneralConsent}

              <Divider sx={{ borderWidth: "1px", marginTop: 2 }} />

              <div className="mt-32 p-16">
                <TableLayoutDetailGudang
                  baseRoutePath={`${router.asPath}`}
                  isEditType
                  tableHead={detailMutasiTableHead}
                  data={detailDataMutasi}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<BackIcon />}
                  sx={{ marginBottom: 1, marginRight: 2 }}
                  onClick={() => router.push("/gudang/mutasi")}
                >
                  Kembali
                </Button>
              </div>
            </Card>
          </Paper>
        </>
      )}
    </>
  );
};

export default DetailMutation;
