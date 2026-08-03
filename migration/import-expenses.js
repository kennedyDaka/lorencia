const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CAFE_ID = '02a8572f-9352-409e-b8b8-bed453205c69';
const ADMIN_ID = 'a7534c3d-4af4-4fa9-acbb-e023b9fb5b5a';

const raw = `10-Jan-25	Kitchen ware	K19500
5-Feb-25	Mixed items	K185000
15-Feb-25	Mixed items	K3500
16-Feb-25	Mixed items	K15500
17-Feb-25	goods	k146500
17-Feb-25	Plastic tray	K26000
18-May-25	COCA-COLA 	K11100
18-Jun-25	SUNLIGHT 1kg 2 in 1 FRESHNESS 	K11495
19-Jun-25	GLACÉ 180ml AIR FRESHNER 	K6495
19-Jun-25	WINCOLENE GLASE & SHINNY SURFACE 	K11695
10-Jul-25	FANTA ORANGE	K5500
12-Jul-25	6 SOBO CHERRY PLUM	K4770
15-Jul-25	JUMBO	K300
15-Jul-25	Purulo	K14948
15-Jul-25	Omo	K9995
15-Jul-25	Salt	K1645
15-Jul-25	S valley icingsugap	 K11590
15-Jul-25	First choice milk	K16350
15-Jul-25	Chapa mandashi baking powder	K1525
15-Jul-25	Larger pure rootbos tea bags	k15215
16-Jul-25	Kericho gld bag	K7538
16-Jul-25	Prestige margarine	K9096
16-Jul-25	Alfords white spirit vinegar	K2325
16-Jul-25	Kitchen wild wou honey	K2985
16-Jul-25	Doom odourless	K7785
16-Jul-25	Joy inst noodles beef flav	K6145
16-Jul-25	Joy inst noodles chicken flav	K6146
16-Jul-25	Sugar brown	K15000
16-Jul-25	Will wings	K5295
16-Jul-25	Save kt mighty biort	K6915
16-Jul-25	S valley s\bicard	K3145
16-Jul-25	Carrying bag reusable	k575
16-Jul-25	Office trays 	K29500
16-Jul-25	Pencil hb flamingo 	K3250
16-Jul-25	Medium punch	K9500
16-Jul-25	Stapler	K15000
16-Jul-25	Desk tidy banter	k13500
16-Jul-25	Pens bic	K10000
16-Jul-25	Rotatrim A4 80Gsm paper	K19500
17-Jul-25	Staple pins 	K3000
17-Jul-25	Post it pads	K1450
17-Jul-25	Paper clips 	K1500
17-Jul-25	30 eggs	K13000
17-Jul-25	Galena cuttery tray	K8000
17-Jul-25	2 mixed goods 	K20000
17-Jul-25	2 mixed goods 	K40000
17-Jul-25	2 mixed goods 	K12000
17-Jul-25	3 mixed goods 	K15000
17-Jul-25	3 mixed goods 	K12000
17-Jul-25	SOBO QUENCH 500ML 24 x 625.00	K15000
17-Jul-25	CERES ORANGE 1 LITRE 1 x 7,895.00	K7895
17-Jul-25	CERES W/GRAPE HANEPOOT 1 LITRE	K7895
17-Jul-25	CERES APPLE 1 LITRE 	K7895
17-Jul-25	CARRIER BAG 60 MIC -REG 	K498
17-Jul-25	Mixed items	M23700
17-Jul-25	Kitchen ware	K165625
17-Jul-25	ROBERTSONS STEAK	K3420
17-Jul-25	ROBERTSONS WHITE	K6360
17-Jul-25	Kitchen knife 	K6000
18-Jul-25	2 baking mat	K13200
18-Jul-25	Worker wear uniform 	K100000
20-Jul-25	Water 20 ltr	K5000
22-Jul-25	Rape leaf bunch	K480
22-Jul-25	Garlic local	K1879
22-Jul-25	Donna's eggs large	K10875
22-Jul-25	Tasty soya sauce 	K12715
22-Jul-25	Meadow delight 	K24995
22-Jul-25	Rich's versus sav & swt	K23125
22-Jul-25	Maggi w/s lezenby 125ml	K4535
22-Jul-25	Fc butter trad seller salted 500g	K18195
23-Jul-25	Red rob bell pepper Env	K1820
23-Jul-25	Sunshin cream of maize	K10325
23-Jul-25	Potatoes medium 	K5209
23-Jul-25	LK clingfilm	K26785
23-Jul-25	T/Sacer 2ply white	K16675
23-Jul-25	Haptic fluchmatic pine	K18778
23-Jul-25	Neptune serviettes 	K3035
23-Jul-25	Tash bag 	K8495
23-Jul-25	Mixed items	K11300
23-Jul-25	Mixed items	K14500
24-Jul-25	Mixed items	K28000
24-Jul-25	HILLHOUSE MEASU 1 M 	K5195
24-Jul-25	CAKE FLORA 2M	K13990
25-Jul-25	CAKE FLORA 2M	K13990
25-Jul-25	CADBURY TWIRL 1M	K9995
25-Jul-25	2 Beef sausage 500G	K29140
25-Jul-25	Bacon streaky 200G	K9420
25-Jul-25	5 Suncrest chambiko 500ML	K7975
25-Jul-25	Sonex classic kiwa	K59995
25-Jul-25	Smokey BBQ	K17395
25-Jul-25	Pizza cutter	K3995
25-Jul-25	Kerry gold milk powder	K26495
25-Jul-25	Veri peri lemon herd african sause 2	K8495
25-Jul-25	Economy	K10281
25-Jul-25	Purola cooking oil 2ltr	K28990
25-Jul-25	Rajah mild and spicy curry powder	K3995
25-Jul-25	Top class 40g grill flavour spice	K8395
25-Jul-25	Garlic 	K2099
25-Jul-25	Mince	K17901
25-Jul-25	Prestige margarine  	K13485
25-Jul-25	Prestige margarine	K 31465
26-Jul-25	Jifa burger box	K4325
27-Jul-25	Aluminum container 	K5000 
27-Jul-25	First choice milk	K31600
27-Jul-25	Mutton cloth	K7290
27-Jul-25	Radox bodywash energised	K9195
29-Jul-25	Mugs	K26990
29-Jul-25	30 eggs	K13000
29-Jul-25	30 eggs	K13000
29-Jul-25	5 s valley icing sugar 500G	K28975
29-Jul-25	4 chicken leg portions 	K25320
29-Jul-25	Kitchen ware	K175000
29-Jul-25	NANA SERVIETES	K3996
30-Jul-25	5 RHODES TOM PASTE 50	K11375
30-Jul-25	GO FRESH ECONOMY MINCE	K19458
30-Jul-25	THANTHWE RED HIBISCUS INFU T/BAG	K6825
30-Jul-25	THANTHWE DET HIBIC-LEM INFU	K6825
30-Jul-25	FRESH PEAS LOCAL	K1479
30-Jul-25	CARRIER BAG	K498
30-Jul-25	RED BELL PEPPER 	K3270
30-Jul-25	THANTHWE H/BOOST GINGER INFUSION	K8495
30-Jul-25	GO FRESH ECONOMY MINCE	K19496
30-Jul-25	AIR SCENTS DIS N REP W/APOLE &  SPICE	K11438
30-Jul-25	MAIZE CORN FLOUR	K5425
30-Jul-25	Books & pads	K3500
30-Jul-25	Books & pads	K4500
30-Jul-25	Office stationery 	K1000
30-Jul-25	LETTUCE LOCAL	K1200
30-Jul-25	ESTRELL GROUNDNUT FLOUR	K2758
30-Jul-25	PEPPER GREEN LOCAL	K4111
30-Jul-25	ONION WHITE 	K4259
1-Aug-25	ONION RED	K4739
1-Aug-25	CARRIER BAG	K498
1-Aug-25	Prestige margarine vanilla 	K47950
2-Aug-25	Water bottle 	K2500
3-Aug-25	1 bucket 	K3305
3-Aug-25	Beef fillets 	K57022
3-Aug-25	Vaseline Blueseal original	K3995
3-Aug-25	LK DISPOSABLE LUNCH BOX	K8995
3-Aug-25	PUROLA COOKING OIL	K28990
3-Aug-25	CAMISA ORANGE JUICE	K15790
3-Aug-25	JUMBO SMALL	K300
3-Aug-25	C&B TANGY MAYONNAISE 	K10995
3-Aug-25	GOLDEN STACKS 95g BBQ FAV CRISPY 	K7145
3-Aug-25	FISHLAND KAPENTA	K6500
3-Aug-25	FISHLAND KAPENTA	K6500
3-Aug-25	SMALL BUNS	K4500
3-Aug-25	CUT BEEF 	K21570
3-Aug-25	LIVER	K32550
4-Aug-25	ECONOMY MINCE	K19800
4-Aug-25	GREEN VEG	K1000
4-Aug-25	TOMATOES 	K7893
5-Aug-25	CARROT	K3340
5-Aug-25	TWIX CHOCOLATE BAR CLASSIC 	K4500
5-Aug-25	EGG TRAY	K16999
5-Aug-25	HARPAZO INVESTMENT SUGAR BITES	K1500
5-Aug-25	2 EMPTY  BIG BAGS 	K900
5-Aug-25	Aluminum container 	K5900
5-Aug-25	Men's tops	K45950
5-Aug-25	Men's tops	K45950
5-Aug-25	JOY MACARONI 	K3999
6-Aug-25	TOPDCK	K3999
6-Aug-25	ELMALEKA	K2399
6-Aug-25	ELMALEKA	K2399
6-Aug-25	FLOUR ESTREL 50g	K4399
6-Aug-25	ROOIBOS TEABAGS	K9999
6-Aug-25	ROOIBOS TEABAGS	K9999
6-Aug-25	TILL BAG	K400
6-Aug-25	2 Pasta joy macaroni 	k9890
6-Aug-25	2B/olivescal black 200G	K15590
6-Aug-25	CARRIER BAG 60 MIC -REG 	K498
6-Aug-25	20 Nyika water 500ml 	K8500
6-Aug-25	12 Cocacola 300nl pet 	K3876
7-Aug-25	12 sobo cherry plum 300ml 	K9548
7-Aug-25	Fanta 300ml Pineapple pet	K11100
7-Aug-25	FANTA ORANGE 300ML PET	K11100
7-Aug-25	1 vanilla 	K8500
7-Aug-25	2 small ribbon	K6000
7-Aug-25	2 sauce bottles 	K5000
7-Aug-25	JACOB GOLD COFFEE 	K38500
7-Aug-25	GLASS CAFEFETIE 	K23995
7-Aug-25	SAVER BROWN 	K11990
7-Aug-25	MUDACK RED FOOD 	K31990
7-Aug-25	MUDACK BAKING	K8995
7-Aug-25	LIBERTY MOP CAP	K12995
7-Aug-25	HP STIRRES 	K649
8-Aug-25	CARRIER BAG	K150
8-Aug-25	Nyika water	K15880
8-Aug-25	Sprite lemon 	K12900
8-Aug-25	Wooden beard clip 	K2000
8-Aug-25	4 Book A6	K4800
8-Aug-25	Pillow 2pcs	K64000
8-Aug-25	Kellogg all bran	K16270
8-Aug-25	Twin saver roller	K12200
8-Aug-25	Jumbo bread sandwich	K3508
8-Aug-25	50 Nana servietes	K8872
8-Aug-25	Lunch Box	K12170
12-Aug-25	Sever brown sachets 	K6755
12-Aug-25	Toddy budget black bag	K9065
12-Aug-25	Prestige margarine vanilla 	K23575
13-Aug-25	Usingini upland filler coffee 	K50575
13-Aug-25	Onion red	K10403
13-Aug-25	Mudaks eggs	K18495
13-Aug-25	Home & leisure 	K12995
13-Aug-25	Coke	K19350
18-Aug-25	Gleane wings	K49000
18-Aug-25	Gleane drumsticks 	K36600
18-Aug-25	Cabbage local	K3300
23-Aug-25	Lilongwe chambiko	K7975
23-Aug-25	Eggs	K30000
23-Aug-25	Cutting board 	K9215
23-Aug-25	Flower	K87300
23-Aug-25	Flower	K40740
23-Aug-25	Flower	K23280
23-Aug-25	Flower	K81400
23-Aug-25	Wall clock	K48500
25-Aug-25	Goods	K11640
6-Sep-25	Double lid trash can	K101850
29-Sep-25	Pine gel	K42350
11-Oct-25	Glodina plush	K40900
11-Oct-25	Plastic 	K200
18-Oct-25	Bamboo skewers	K2200
18-Oct-25	Cake paper 	K13000
18-Oct-25	Yellow bell pepper	K3791
18-Oct-25	Sun rest chambiko	K8725
18-Oct-25		K85025
1-Nov-25		k16061
1-Nov-25	2 EGGS 30 pack 	K30000
19-Nov-25		k58820
20-Nov-25	Napkin paper serviettes	K17275
30-Nov-25	CUT BEEF 	K17675
30-Nov-25	jumbo salted nuts	k14665
20-Dec-25	BbQ peanuts	k8505
20-Dec-25	de vries choc dbl velvet	k15190
20-Dec-25	de vries chooc chip cookies	k8895
22-Dec-25	de vries chooc chip cookies	k7795
22-Dec-25	jumbo salted nuts	k2095
22-Dec-25	BbQ peanuts	k1215
22-Dec-25	Carrier bag	k498
29-Dec-25	carrier bag	k498
22-Jan-26	de vries choc dbl velvet	k15190
22-Jan-26	de vries chooc chip cookies	k15590
22-Jan-26	de vries chooc chip cookies	k17790
22-Jan-26	bkrs chockits orig	k21990
22-Jan-26	STEAK	k25625
22-Jan-26	T-BONE	k30000
22-Jan-26	STEAK MINCE	k129610
22-Jan-26	PLASTIC BAG	k400
22-Jan-26	carrier bag	k1200
22-Jan-26	green pepper	k2900
29-Jan-26	green beans	k1976
30-Jan-26	Cabbage local	k2000
30-Jan-26	LETTUCE LOCAL	k6000
1-Feb-26	carrots local	k3575
2-Feb-26	yellow& red pepper	k28175
3-Feb-26	fanta orange	k4050
3-Feb-26	rajah curry powder	k5500
3-Feb-26	robortson italian herb	k9250
3-Feb-26	robertson steak& chops spice	k9500
3-Feb-26	perfect baking cake flour	k24000
5-Feb-26	COCA-COLA 	k6750
5-Feb-26	Sprite 	k2700
7-Feb-26	sobo cherry plum	k5995
10-Feb-26		k154998
12-Feb-26		k64950
12-Feb-26		k493400
12-Feb-26		k113571
12-Feb-26	cleanroll kitchen towel	k10198
12-Feb-26	mama\`s choice chambiko	k11075
12-Feb-26	Bigtree binto ginger can	k4870
12-Feb-26	Gik lemon fresh	k11298
12-Feb-26	S\crest yog vanilla	k4998
12-Feb-26	windolene regular	k13215
12-Feb-26	angel dry yeast	k10685
12-Feb-26	hilife handwash green apple	k9190
12-Feb-26	boom powder 	k17395
12-Feb-26	matches leopard	k1565
12-Feb-26	s\flake baking powder	k18395
13-Feb-26	onion red local	k6042
13-Feb-26	carrots local	k2598
13-Feb-26	Cabbage local	k1650
13-Feb-26	carrot local	k1519
13-Feb-26	rob BBQ spice	k7295
14-Feb-26	rob black pepper	k3795
16-Feb-26	blueband	k8115
16-Feb-26	boom 	k14790
16-Feb-26	carrots local	k2488
16-Feb-26	onion wHITE 	k22711
16-Feb-26		k387480
16-Feb-26	smalll ceramic plates	k13800
16-Feb-26	hot pack aluminium	k22900
16-Feb-26	hot pack aluminium	k20600
16-Feb-26	hot pack aluminium	k28700
16-Feb-26	hot pack aluminium	k17200
16-Feb-26	hotpack baking pap	k17990
16-Feb-26	single wallpaper	k24990
16-Feb-26	celling film	k126450
16-Feb-26	hotpack single wal	k36750
16-Feb-26	kitchen towel	k32150
16-Feb-26	hotpack single wal	k45950
16-Feb-26	mixed items	k203900
16-Feb-26	hamburger box	k12000
16-Feb-26	pomade 	k7500
16-Feb-26	cosmetic brushes	k2500
16-Feb-26	cake decorations	k15000
16-Feb-26	school supplies	k22000
16-Feb-26	Mixed items	k13200
16-Feb-26	Sugar brown	k52000
16-Feb-26	Jumbo bread sandwich	k3915
16-Feb-26	burger box	k15590
16-Feb-26	plastic tablespoon	k3495
16-Feb-26	plastic cutlery spoon	k3995
16-Feb-26	suncrest chambiko	k7540
18-Feb-26	suncrest chambiko	k1885
18-Feb-26	masamba	k1280
18-Feb-26	cucumber fresh	k981
18-Feb-26	green beans	k1271
18-Feb-26	prestige margerine	k115080
18-Feb-26	steers rave sauce	k12995
18-Feb-26	steers garlic sauce	k12995
18-Feb-26	Doom odourless	k9695
18-Feb-26	koo whole kernel	k29580
18-Feb-26	dishwashing liquid lemon	k19980
18-Feb-26	white sprite vinger	k4990
19-Feb-26	hygienix antiseptic liquid	k8445
19-Feb-26	methylated spirits	k4545
19-Feb-26	carrot	k5547
19-Feb-26	fabulous prime leg portion	k37125
20-Feb-26	fabulous prime fillets	k43225
20-Feb-26	jumbo small	k300
28-Feb-26	jumbo small	k300
1-Mar-26	cleanroll kitchen towel	k10198
1-Mar-26	tangy mayo	k14755
1-Mar-26	maya fair sliced black olives	k22195
2-Mar-26	granole pasta	k14595
2-Mar-26	tangy mayo	k14755
2-Mar-26	moirs essence van	k16695
2-Mar-26	liberty mroom piec& in brn	k21395
2-Mar-26	chipungaground	k21615
3-Mar-26	thanthwe ant-ox mon-pine infu	k13770
3-Mar-26	joes classic white sandwich	k5398
3-Mar-26	blueband	k6995
6-Mar-26	lays thai sweet chilli	k1625
26-Mar-26	LETTUCE LOCAL	k2550
26-Mar-26	cleanroll kitchen towel	k10198
28-Mar-26	clover feta trad	k15195
28-Mar-26	boom t\cleaner pine	k10790
28-Mar-26	boom force crm cit fresh	k5895
28-Mar-26	knorr sd crmy greek	k12395
28-Mar-26	knorr sd crmy greek	k12395
9-Apr-26	knorr sd crmy greek	k12395
9-Apr-26	onion white	k9433
14-Apr-26	purola 2 ltr	k54380
14-Apr-26	Oreo original 	K9750
14-Apr-26		k32821
23-Apr-26	mozzarella cheese	k40995
25-Apr-26	can spar berry	k34880
26-Apr-26	mixed items	k59400
27-Apr-26	Nyika water	k7900
28-Apr-26	sobo cherry plum	k11940
7-May-26	COCA-COLA 	k13140
7-May-26	fanta orange	k13140
9-May-26	TOMATOES 	k5122
18-May-26	can pepsi	k17250
18-May-26	sugar white	k114000
18-May-26	boom powder 	k9615
18-May-26	Sunshin cream of maize	k11278
18-May-26	purola 2 ltr	k28790
18-May-26	prestige margarine	k47150
18-May-26	canderell sticks yellow	k22425
18-May-26	thanthwe im\boost lem gin infu	k25725
18-May-26	tea lemon grass	k11272
18-May-26	burger rolls	k3738
18-May-26	Jumbo bread sandwich	k3508
18-May-26	Cabbage local	k1400
18-May-26		k226390
19-May-26	12 by 12 tall box glass	k40000
19-May-26	10 by 10 tall box glass 	k35000
19-May-26	40 by 40 16 inches boxes	k12000
19-May-26	board 16 inches	k9000
22-May-26	dishwash 	k14000
22-May-26	Pine gel	k25000
22-May-26		k135000
22-May-26		k135356
22-May-26	mixed items	k14300
22-May-26		k44000
22-May-26		k73000
22-May-26		k41770
22-May-26		k307800
22-May-26		k66400
22-May-26		k15600
22-May-26		k104370
22-May-26		k18200
22-May-26	courier services	k6000
22-May-26	courier services	k9600
23-May-26	courier services	k8000
23-May-26	1 set of two mesh tray	k29500
23-May-26	5 pencil standard	k3250
23-May-26	1 medium punch	k9500
23-May-26	1 staple machine	k15000
23-May-26	1 desk organiser	k13500
23-May-26	10 bic pens	k10000
23-May-26	1 ream rota	K19500
23-May-26	1box staple pins	k3000
23-May-26	1 stick notes	k1450
23-May-26	Paper clips 	k1500
23-May-26		k123280
23-May-26	STEAK MINCE	k104390
23-May-26	plastic	k500
23-May-26	STEAK MINCE	k122330
23-May-26	biltong	k950
23-May-26	STEAK MINCE	k103870
23-May-26	plastic	k500
23-May-26		k53170
23-May-26	ramp steak	K27170
23-May-26	Tbone 	K26000
23-May-26	4 12 by 12 rectangle boxes	k10000
23-May-26	2 14 by 14 normal boxes	k5000
23-May-26	5 12 by12 tall boxes	k13500
23-May-26	plas + pt	k4000
23-May-26	liquid dish wash	k13000
24-May-26	red sorgum	k11000
24-May-26	chic seeds	k8500
24-May-26	wrapped sofa 2 and  stand 	k50000
24-May-26	7 10 by 10 inches boards	k9100
24-May-26	15 10 inches tall boxes	k40500
24-May-26	flowers	k6000
24-May-26	9 inches tall box	k18000
24-May-26	5 9inches normal	k8500
24-May-26	15 9inches boxes	k19500
24-May-26	wallpapers	k60000
24-May-26	1 glue	k15000
24-May-26	goat meat 	k20500
25-May-26	STEAK MINCE	k52000
27-May-26	plastic	k500
28-May-26	STEAK MINCE	k78000
28-May-26	2 EGGS 30 pack 	k30000
28-May-26	LPG	k120360
28-May-26	3 sets of dinning chairs and 3 tables	k4680000
28-May-26	LPG	k101660
29-May-26	handigas cyl	k85023
29-May-26	LPG	k72060
29-May-26	courier services	k60000
29-May-26	topside 	k27500
30-May-26	18 12 by 12 boxes	k36000
30-May-26	10 by 10 boxes   	k18000
2-Jun-26	10 by 10 boxes 12 by 12 rectangle boxes	k12500
11-Jun-26	10 by 10 boards	k7800
11-Jun-26	14 by 14 boards	k3000
11-Jun-26	braai	k38600
14-Jun-26	ios	k27500
14-Jun-26	bag	k300
14-Jun-26	edible topper	k13500
14-Jun-26	sandwich papers	K19500
17-Jun-26	goat meat 	k36000
17-Jun-26	pets	k33300
29-Jun-26	ks	k15050
29-Jun-26	disticks	k80600
29-Jun-26	3 pots	k40800
29-Jun-26	STEAK MINCE	k125875
29-Jun-26	20 10 by 10 mimi tall boxes 	k44000
29-Jun-26	STEAK MINCE	k55300
29-Jun-26	active care adult pants 8s As sorted sizes	k99000
29-Jun-26	curtain	k135000
29-Jun-26	LPG	k71060
29-Jun-26		k15000
29-Jun-26	wooden box and round tables	k18640
29-Jun-26	flowers	k9600
29-Jun-26	basket of flowers	k8000
29-Jun-26	leg portion	k34600
29-Jun-26	jumbo of flowers	k4200
29-Jun-26	flowers	k5000
29-Jun-26	Oreo original 	k9750
29-Jun-26	chambiko	k7975
29-Jun-26	eggs 	k30000
29-Jun-26	green beans	k3705
29-Jun-26	pasta	k14945
29-Jun-26	cardbury d\milk	k12345
3-Jul-26	CARRIER BAG 	k465
3-Jul-26	green pepper	k5005
3-Jul-26	large red pepper	k3665
3-Jul-26	Yellow bell pepper	k3741
3-Jul-26	tall box glass 12 by 12	k40000
3-Jul-26	tall box glass 10 by 10	k35000
3-Jul-26	20 coke	k19350
3-Jul-26	blueband	k11495
3-Jul-26	eggs 	k25990
3-Jul-26	burger sesame	k3250
3-Jul-26	chambiko	k8725
3-Jul-26	coke 	k19350
3-Jul-26	Nyika water	k7900
3-Jul-26	fanta orange	k13740
3-Jul-26	COCA-COLA 	k13740
3-Jul-26	sobo cocopina	k11340
3-Jul-26	fanta passion	k13740
3-Jul-26	gas 	k71060
3-Jul-26	liquid dishwash	k13000
3-Jul-26	eggs	k25990
3-Jul-26	8 tray toings	k36760
3-Jul-26	beef steak	k42004
3-Jul-26	T-BONE	k41813
3-Jul-26	GLOVER CHEESE	k5715
3-Jul-26	GLOVER CHEESE	k5715
13-Jul-26	Glene wings	k29400
13-Jul-26	dairy chambiko	k6592
13-Jul-26	non woven spunbond bag	k498
14-Jul-26	chambiko	k1648
2-Mar-26	topside steak	k41004
2-Mar-26	 T-bone with fillet	k41814
2-Mar-26	Clover IWS Gouda slices	k5715
2-Mar-26	Clover IWS cheddar 	k5715
6-Dec-25	small mandasi	k1000
6-Dec-25	choice mince prepack	k33588
26-Nov-25	green beans 	k720
26-Nov-25	green veg	k1500
26-Nov-25	carrot	k2583
26-Nov-25	nestle kit kat	k4999
18-Nov-25	mushrooms 	k10220
18-Nov-25	cucumber 	k1855
18-Nov-25	lemon	k6916
18-Nov-25	can pepsi	k5590
18-Nov-25	fruto juice tropical glass	k22725
18-Nov-25	fruto juice guava glass	k4545
18-Nov-25	carrier bag	k498
19-Nov-25	white pepper 	k11000
19-Nov-25	garlic powder 	k12500
19-Nov-25	steak and chops 	k3000
19-Nov-25	mixed masala 	k32000
19-Nov-25	mixed curry herb	k9000
6-Dec-25	garlic local	k10675
6-Dec-25	jumbo breed sandwich 	k3508
6-Dec-25	mixed items	k54200
26-Jan-26	nature nactar water	k1995
28-Jan-26	cpx eggs	k14500
31-Jan-26	coke	k16800
21-Dec-25	krunchy nak	k8500
21-Dec-25	kotex pad	k5500
21-Dec-25	kotex pad 	k5500
21-Dec-25	dyroach tr	k12950
21-Dec-25	illovo brown	k20000
21-Dec-25	plastic bag	k250
17-Jun-26	mixed items	k18200
2-Jan-26	first choice milk 	k16250
2-Jan-26	jumbo small 	k300
16-Jul-25	cake flour 	k60000
12-Jun-26	burger bun	k3650
14-Jan-26	hit green tea 	k7215
23-Jul-26	sobo quench 	k15000
23-Jul-26	Ceres orange 	k7895
23-Jul-26	Ceres w/grape hanepoot	k7895
23-Jul-26	carrier bag	k498
24-Sep-25	kitchen ware	k2000
20-Sep-25	ff ckn wings	k45000
13-Jul-26	carrier bag	k698
5-Sep-25	ff ckn drumstick 	k16300
5-Sep-25	eggs	k12495
5-Sep-25	sobo cherry plum 	k9540
5-Sep-25	fanta pineapple 	k11100
5-Sep-25	sobo cocopina	k9540
5-Sep-25	choice mince	k38000
7-Sep-25	bb jumbo bread sandwich 	k3508
7-Sep-25	cucumber  local 	k1500
7-Sep-25	mayo	k12995
7-Sep-25	carrier bag	k498
6-Sep-25	robs cinnamon 	k13590
17-Sep-25	cp eggs	k17395
18-Sep-25	flour	k110000
18-Sep-25	eggs	k13595
12-Sep-25	chicken fillet 	k6295
9-Sep-25	eggs	k13595
13-Sep-25	lemons	k3861
12-Sep-25	cake cup	k9000
26-Sep-25	jifa burger box 	k21625
7-Sep-25	aluminum container 	k8850
1-Oct-25	chambiko	k3110
3-Oct-25	winning star electric iron	k39995
3-Oct-25	eggs	k13595
3-Oct-25	eggs 	k13595
25-Sep-25	Hungarian sausage 	k5290
26-Sep-25	protex fresh shower 	k25200
26-Sep-25	laser it ready razor	k3250
26-Sep-25	Vaseline cocoa glow lotion 	k18500
26-Sep-25	Nivea pure invisible roll on	k10050
26-Sep-25	jumbo 	k450
26-Sep-25	reg union	k10485
26-Sep-25	ff ckn leg portion 	k38200
26-Sep-25	ff ckn drumstick 	k45000
26-Sep-25	mixed items	k50000
2-Oct-25	liberty pitted 	k10995
2-Oct-25	liberty golden 	k19495
2-Oct-25	cake flora thic	k8990
2-Oct-25	cake flora cake	k4990
2-Oct-25	footys future	k5195
2-Oct-25	footys future	k5195
2-Oct-25	caring candies 	k9995
20-Aug-25	mixed items	k109000
2-Oct-25	suncrest chambiko	k8475
2-Oct-25	jumbo small 	k300
11-Oct-25	Rajah mild n spicy 	k2395
11-Oct-25	robs mixed herbs	k2995
11-Oct-25	robs black pepper 	k3295
11-Oct-25	Rob spice bbq	k2895
12-Oct-25	Tangy mayonnaise 	k14495
10-Oct-25	first choice milk 	k32600
10-Oct-25	kukoma cooking oil	k14295
9-Oct-25	lettuce local 	k600
8-Oct-25	eggs	k27190
11-Oct-25	plastic 	k12500
4-Oct-25	kukoma cooking oil	k14295
4-Oct-25	orange squash 	k9395
4-Oct-25	kingtox spray 	k5695
4-Oct-25	jumbo small 	k300
4-Oct-25	eggs	k13595
28-Mar-26	nyika water 	k6840
5-Apr-26	pet coke	k40800
5-Apr-26	 cocopina pet	k11600
5-Apr-26	water bottle 	k2500
23-Mar-26	kwithu kitchen tomato sauce 	k7195
23-Mar-26	kwithu kitchen tomato sauce 	k7195
28-Mar-26	restaurant 	k18000
27-Mar-26	dairy chambiko 	k8240
25-Mar-26	polar strawberry 	k22295
25-Mar-26	red/yellow/ora	k8355
25-Mar-26	cake flora gel	k7995
25-Mar-26	cake flora gel	k7995
25-Mar-26	cake flora gel	k7995
25-Mar-26	spice from heav	k6995
25-Mar-26	polar vanilla 	k7995
25-Mar-26	cake flora Rega	k7995
25-Mar-26	savers carrier 	k500
28-Mar-26	meadowland classique 	k29995
28-Mar-26	divella linguine	k15990
28-Mar-26	sugar brown	k23000
28-Mar-26	sugar demerara	k17100
28-Mar-26	green beans 	k1635
28-Mar-26	non woven spunbond bag	k498
28-Sep-25	eggs	k27190
28-Sep-25	Neptune papper servieties	k3295
28-Sep-25	Neptune papper servieties	k3295
28-Sep-25	Neptune papper servieties	k3295
28-Sep-25	Neptune papper servieties	k3295
28-Sep-25	disposable small plate	k1995
28-Sep-25	disposable small plate	k1995
28-Sep-25	plastic disposable big plate	k6575
28-Sep-25	plastic disposable big plate	k6575
19-Sep-25	selati castor snow	k11500
19-Sep-25	selati castor snow	k11500
24-Sep-25	Tangy mayonnaise 	k13495
24-Sep-25	ori beef cocktail 	k20545
24-Sep-25	lunch box jumbo 	k16750
24-Sep-25	carrier bag 	k498
24-Sep-25	suncrest chambiko	k8475
22-Aug-25	12 inch board colour Masonite	k27000
22-Aug-25	12 inch papper box open one side 	k38000
22-Aug-25	10 inch board colour Masonite 	k22000
22-Aug-25	garbella flower cutter 	k5500
22-Aug-25	jumbo big	k700
22-Aug-25	black intense	k9000
22-Aug-25	egg yellow food gel cake flora	k6500
19-Sep-25	Hersheys syrup 	k26500
19-Sep-25	Hersheys syrup 	k26500
19-Sep-25	Robertsons black pepper 	k12999
19-Sep-25	garlic 	k7605
19-Sep-25	ginger 	k1240
19-Sep-25	prestige margarine 	k11500
19-Sep-25	empty big bag	k450
12-Mar-26	first choice milk 	k2445
12-Mar-26	prestige margarine 	k4595
12-Mar-26	prestige margarine 	k4595
21-Aug-25	eggs	k23990
28-Aug-25	liberty cocoa	k89995
30-Aug-25	Cadbury Oreo original 	k9836
30-Aug-25	dairymaid van	k21975
20-Aug-25	cake flour 	k200000
24-Aug-25	ff ckn drumstick 	k24450
24-Aug-25	ff ckn leg portion 	k20850
24-Aug-25	suncrest chambiko	k7975
25-Aug-25	coke	k15050
25-Aug-25	coke pet	k33000
28-Mar-26	oranges	k4878
28-Mar-26	RED BELL PEPPER 	k9268
20-Aug-25	mudak red food	k15995
20-Aug-25	liberty bambou 	k22995
20-Aug-25	Home & leisure 	k5995
20-Aug-25	Home & leisure 	k9995
8-Jul-26	mixed items	k136855
23-Oct-25	mixed items	k213821
6-Sep-25	courier services	k4200
22-Aug-25	nyika water	k8500
9-Aug-25	mixed items	k318430
13-Jul-26	estrell water	k10136
13-Jul-26	deposit water bottle	k40200
13-Jul-26	carrot	k6813
31-Jul-25	mixed items	k288500
15-Jul-26	first choice milk 	k8750
15-Jul-26	jumbo small	k300
16-Oct-25	bacon back	k10470
16-Oct-25	Bacon streaky 200G	k10450
17-Oct-25	goods	k21000
16-Oct-25	mixed items	k64682
13-Oct-25	matches leopard	k3100
17-Oct-25	eggs	k27190
15-Oct-25	goods	k2300
14-Oct-25	eggs	k27190
17-Oct-25	mixed items	k57380
17-Oct-25	mixed items	k74210
17-Oct-25	mixed items	k282 433
17-Oct-25	mixed items	k122423
18-Oct-25	coke	k2131
18-Sep-25	glitters white	k8500
18-Sep-25	cupcake linners	k7000
18-Sep-25	10 inch purple box 	k26000
18-Sep-25	10 inch purple box  open one side	k38000
18-Sep-25	jumbo big	k700
6-Mar-26	mayonise	k11995
15-Mar-26	mixed items	k117960
31-Mar-26	red \yellow ora	k4117
7-Apr-26	mixed items	k160900
4-Aug-25	mixed items	k243300
5-Aug-25	clingfilm 	k26785
5-Aug-25	server kt white	k9225
5-Jun-26	Jumbo bread sandwich	k3915
15-Dec-25	big mega lighter 	k18445
15-Dec-25	energizer max	k19975
4-Aug-25	simple cho cash box	k47900
13-Jul-25	liming tap	k5000
13-Jul-25	painting brush	k1600
22-Jul-25	goods	k12000
29-Jul-25	cavendish	k20995
29-Jul-25	big mega lighter 	k16795
4-Aug-25	mixed items	k115400
8-Aug-25	plastic bag	k100
8-Aug-25	goods	k7600
8-Aug-25	goods	k7000
8-Aug-25	tape	k4200
8-Aug-25	goods	k5500
28-Jul-25	goods	k4200
28-Jul-25	Kitchen knife 	k13000
28-Jul-25	goods	k18000
28-Jul-25	aluminium foil	k9400
28-Jul-25	aluminium foil	k15000
28-Jul-25	goods	k2000
28-Jul-25	pairing knife	k2000
28-Jul-25	spice small jar	k9000
25-Jun-25	mixed items	k159400
8-Aug-25	mixed items	k467800
31-Jan-26	sugar white	k28500
31-Jan-26	Potatoes medium 	k8908
18-Jun-26	knqrr italian salad dressing	k6200
18-Jun-26	robertson steak& chops spice	k8900
18-Jun-26	ekhya carrier bag	k500
28-Jul-25	mixed items	k480000
18-Nov-25	mixed items	k145325
10-Mar-26	goods	k87366
28-Aug-25	goods	k91585
6-May-26	topper normal	k10000
6-May-26	new topper	k30000
11-Jul-26	mixed items	k181499
31-Jan-26	lettuce local 	k1200 
31-Jan-26	hit rat trap glue	k7555
21-Aug-25	can pepsi max	k11385
21-Aug-25	can pepsi light	k11385
21-Aug-25	essence vanilla 	k10530
21-Aug-25	boom	k5045
21-Aug-25	carrier bag	K49000
14-Apr-26	mixed items	k187522
9-Jun-26	first choice milk 	k35000
9-Jun-26	Jumbo bread sandwich	k3400
31-May-26	mixed items	k293215
9-Jun-26	green beans	k1395
7-Jun-26	mixed items	k202066
29-May-26	mixed items	k121185
14-Jun-26	mixed items	k241893
20-Oct-25	mixed items	k98638
13-Apr-26	cleanroll kitchen towel	k10000
13-Apr-26	Cabbage local	k3300 
13-Apr-26	soda	k3598
19-Dec-25	drumstick	k41000
19-Dec-25	prestige margarine 	k4495
19-Dec-25	prestige margarine 	k4495
19-Dec-25	prestige margarine 	k4495
19-Dec-25	prestige margarine 	k4495
19-Dec-25	prestige margarine 	k4495
7-May-26	goods	k21378
17-Apr-26	mixed items	k62175
2-Jul-26	stationary	k1800 
2-Jul-26	stationary	k9600
2-Jul-26	cards	k24000
5-Feb-26	topside 	k36110
7-May-26	mixed items	k86546
7-Feb-26	goods	k44595
17-Apr-26	chambiko	k9425
17-Apr-26	jumbo small	k300
24-Feb-26	goods	k37485
26-Apr-26	goods	k33413
6-Aug-25	mixed items	k136627
6-Feb-26	mixed items	k360827
16-Apr-26	mixed items	k217315
24-Feb-26	mixed items	k263396
22-Jun-26	mixed items	k188650
22-Dec-25	mixed items	k135350
7-Sep-25	mixed items	k99183
3-Sep-25	mixed items	k154659
26-Jul-25	bottom freezer ,consol crate with stakable 950ml	k1900410
16-Jul-25	cake flour 	k60000
13-Jul-26	drumstick	k5800
13-Jul-26	wings	k10940
26-Jun-26	ECONOMY MINCE	k12012
7-Jun-26	burger bun	k7350
3-Sep-25	eggs,soda n chambiko	k19280
12-Jun-26	Cabbage local	k3300
12-Jun-26	rice	k42328
12-Jun-26	kukoma cooking oil	k16258
2-Sep-25	4 glass oil vingar	k27996
2-Sep-25	snack kamba	k1199
2-Sep-25	till bag	k400 
21-Dec-25	assorted items	k52700
22-Dec-25	goods	k32490
31-Jan-26	eggs	k29000
12-Aug-25	fan heater geepas 	k99000
3-Apr-26	10 inch paper box	k10000
3-Apr-26	10 inch board colour Masonite 	k6000
31-Jan-26	eggs 	k14500
11-Jun-26	l\fruit berry blast 	k13485
11-Jun-26	l\fruit b\fast punch	k13485
11-Jun-26	savers brown sugar sachets	k13510
11-Jun-26	carrier bag	k465
23-Aug-25	mixed items	k194229
22-Aug-25	parcel	k4200
27-May-26	mixed items	k170500
6-Mar-26	all gold fine apricot jam	k4445
5-Feb-26	mixed items	k230441
12-Jul-26	aqualina 5 ltr purified water	k7980
12-Jul-26	kukoma cooking oil	k41385
6-Mar-26	nyika water	k19250
20-Aug-25	20 mixed goods	k6000
20-Aug-25	5 mixed goods	k10000
20-Aug-25	4 cont artic mocha cup	k12000
20-Aug-25	2 mixed goods 	k16000
20-Aug-25	1 mixed good	k25000
20-Aug-25	1 therm 7q cooler blue 	k40000
21-Aug-25	ceres w/grape hanepoot	k7895
21-Aug-25	ceres pinapple 	k7895
21-Aug-25	camisa juice orange	k17590
21-Aug-25	carrier bag	k498
31-Aug-25	mixed items	k100986
2-Sep-25	afrox handgas	k71060
15-Dec-25	mixed items	k179703
6-Mar-26	mixed items	k200147
22-Nov-25	mixed items	k96772
28-Jan-26	goods	k33533
31-Aug-25	mixed items	k106191
12-Sep-25	goods	k84250
13-Sep-25	mixed items	k245512
27-Sep-25	mixed items	k112360
26-Sep-25	goods	k32205
2-Oct-25	mixed items	k122235
4-Oct-25	mixed items	k90132
10-Oct-25	mixed items	k213735
2-May-26	yeast	k3390
28-Aug-25	choice mince	k17800
6-Apr-26	banana	k2615
6-Apr-26	garlic loose local	k8131
6-Apr-26	big pepper choice	k12650
6-Apr-26	pepsi cola orignal	k33000
6-Apr-26	fanta orange	k20000
6-Apr-26	watermelon	k6095
6-Apr-26	carrier bag	k850
29-Mar-26	goods	k81174
30-Mar-26	goods	k59985
9-Mar-26	mixed items	k113405
6-Apr-26	lettuce local 	k3400
6-Apr-26	summer grape fruit+lemon s-gel	k8798
6-Apr-26	chilli kambuzi	k3376
6-Apr-26	stay free uncented regular	k8970
6-Apr-26	carrier bag	k465
28-Mar-26	mixed items	k136995
9-Apr-26	mixed items	k213657
9-Apr-26	jumbo big	k495
8-May-26	mixed items	k588793
30-Apr-26	carrot	k7103
30-Apr-26	eggs	k30000
30-Apr-26	first choice milk 	k8480
24-Mar-26	wings	k9320
19-Apr-26	non taxable items	k8600
18-Apr-26	facial tissues	k1595
24-Mar-26	wings	k9320
19-Apr-26	par cheddar slice	k11395
19-Apr-26	nyika water	k8700
17-Apr-26	eggs	k30000
19-Apr-26	fillet	k8000
19-Apr-26	coke	k19350
21-Apr-26	first choice milk 	k33920
21-Apr-26	soft white facial tissue	k1595
21-Apr-26	soft white kitchen towel	k6295
21-Apr-26	eggs	k15000
27-Jun-26	mixed items	k220490
30-Jun-26	balloon	k2500
30-Jun-26	balloon	k3500
17-Jun-26	mixed items	k185914
20-Apr-26	mixed items	k206350
23-Apr-26	burger buns	k4255
23-Apr-26	hotdog rolls 	k3738
23-Apr-26	plastic fork	k3785
23-Apr-26	plastic spoons	k3785
23-Apr-26	non woven spunbond bag	k498
16-Apr-26	first choice milk 	k32600
19-Feb-26	gift items	k30382
9-Feb-26	coke	k19350
3-Jul-26	daddies sweet chilli sauce	k7670
3-Jul-26	nestle bar one	k1225
3-Jul-26	kitchen ware	k3000
3-Jul-26	containers	k35000
3-Jul-26	disposable meal box	k17200
3-Jul-26	drinking straw	k15000
3-Jul-26	natural bamboo stick	k6000
3-Jul-26	disposable plates	k8600
22-Feb-26	ultra link	k31000
13-Jul-26	alessi gold instant coffee	k45795
17-Apr-26	clere pure glycerine	k6000
17-Apr-26	playboy amazon spray	k14500
17-Apr-26	playboy lotion code black	k14500
17-Apr-26	nivea men fresh sensation anti-germ	k15000
17-Apr-26	jumbo	k450
5-Feb-26	sugar white	k28500
5-Feb-26	cardbury p.s. large	k4525
5-Feb-26	snickers singles	k6715
2-Feb-26	oranges	k1464
2-Feb-26	chambiko	k1748
21-Apr-26	mixed items	k229435
5-Jul-26	first choice milk 	k17450
5-Jul-26	jumbo small	k300
28-Jan-26	mixed items	k160000
24-Jun-26	mixed items	k103750
25-Feb-26	goods	k60460
17-Apr-26	mixed items	k51800
17-Apr-26	chipungaground	k41868
17-Apr-26	goods	k77913
3-Jun-26	s valley cake flour	k40395
10-Jan-26	mixed items	k101200
11-Jul-26	fillet	k12420
15-May-26	first choice milk 	k32600
22-Jun-26	active care adult diapers 10	k46995
26-Apr-26	bonogwe bunch	k600
26-Apr-26	nkhwani bunch	k800
26-Apr-26	Yellow bell pepper	k3665
26-Apr-26	watermelon	k6183
26-Apr-26	burger patties	k22021
26-Apr-26	Hungarian sausage 	k25100
26-Apr-26	carrier bags	k450
6-May-26	coke	k40800
4-May-26	coke	k19350
5-May-26	soft white towel	k6295
3-May-26	sunlight750ml dishwash lemon	k13990
6-May-26	eggs	k14495
6-May-26	water bottle 	k2500
6-May-26	angel instant dry yeast	k9195
27-May-26	blueband	k9495
28-May-26	eggs	k30000
23-Apr-26	estrell water	k5068
2-Jun-26	thanthwe ant-ox mon-pine infu t\bags	k13770
2-Jun-26	sunlight powder pink 1kg	k25310
2-Jun-26	carrier bag	k465
2-Jun-26	detrex soap	k6996
2-Jun-26	stay free uncented regular	k8970
20-Apr-26	goods	k55366
3-Feb-26	coke	k16800
20-Apr-26	twinsavwer 2 ply tissui	k19800
20-Apr-26	omo	k39500
20-Apr-26	sobo cherry plum	k1199
20-Apr-26	seal tape	k7495
30-Jun-26	mixed items	k166146
21-Jun-26	basket   	k24000
21-Jun-26	basket   	k24000
5-Jun-26	flourich cake flour 	k245000
31-Jan-26	nuvita 100g cookies cashesnut	k1945
23-Apr-26	mixed items	k326347
12-Jun-26	burger patties	k50020
12-Jun-26	carrier bag	k850
16-Mar-26	mixed items	k142780
21-Apr-26	Rajah mild n spicy 	k18999
21-Apr-26	simba mrs.ball chutney	k8250
21-Apr-26	summer shower gel	k9500
6-Feb-26	bella spaghetti	k2295
6-Feb-26	chambiko	k8725
6-Feb-26	jumbo small	k300
1-Dec-26	Yellow bell pepper	k2652
1-Dec-26	carrot	k5210
1-Dec-26	Red bell pepper 	k2047
1-Dec-26	Carrier bag	k498
25-Oct-25	Lk plastic cutlery forks	k3995
25-Oct-25	eggs	k27190
19-Oct-25	goods	k46910
23-Oct-25	eggs	k13595
23-Oct-25	standard bread	k2575
23-Oct-25	Chapa mandashi baking powder	k1495
23-Oct-25	prestige margarine 	k4495
23-Oct-25	prestige margarine 	k4495
28-Oct-25	prestige margarine 	k4495
28-Oct-25	prestige margarine 	k4495
29-Nov-25	goods	k95687
30-Nov-25	ori beef sausages	k37350
26-Nov-25	chambiko	k6041
26-Nov-25	carrierbag	k498
28-Nov-25	doom	k5345
28-Nov-25	can sparletta	k6916
28-Nov-25	apples top red	k2248
28-Nov-25	can spar berry	k10374
28-Nov-25	can sparletta	k3458
28-Nov-25	carrier bag	k498
15-Dec-25	eggs	k29990
17-Aug-25	goods	k94318
4-Jul-26	mixed items	k118147
14-Jul-26	goods	k62892
3-Mar-26	chambiko	k6592
3-Mar-26	chambiko	k1648
3-Mar-26	non woven spunbond bag	k498
2-Mar-26	Gleane wings	k29400
4-Mar-26	first choice milk 	k33920
26-Feb-26	goods	k66980
11-Apr-26	fillet	k24000
11-Apr-26	leg portion	k27680
11-Apr-26	wings	k46600
25-Apr-26	goods n drinks	k30555
26-Jun-26	carrot	k7247
26-Jun-26	purola 2 ltr	k13595
31-May-26	eggs	k31990
5-Jun-26	Gleane wings	k49000
12-May-26	sun valley cake flour	k13375
12-May-26	jumbo small	k300
24-Mar-26	mixed items	k100026
23-Mar-26	mixed items	k182700
4-Nov-25	leg portion	k15280
4-Nov-25	wings	k18000
4-Nov-25	drumstick	k17000
4-Nov-25	fillet	k16000
15-Mar-26	mixed items	k102230
15-Mar-26	mixed items	k107500
15-Mar-26	supanova sutton back	k100300
15-Mar-26	maggi lazenby	k6960
15-Mar-26	windolene window	k9300
11-Mar-26	mixed items	k170100
12-Mar-26	mixed items	k120450
10-Dec-25	mixed items	k205925
6-Dec-25	mixed items	k140781
8-Nov-25	goods	k68230
4-Nov-25	goods	k32475
25-Jun-26	goods	k61545
7-Apr-26	mixed items	k121296
16-Nov-26	mixed items	k117105
12-Mar-26	Meadow delight 	k24745
15-May-26	pasta joy spaghetti	k4995
11-May-26	cake flour 	k28795
11-May-26	fanta pineapple 	k14340
11-May-26	fanta passion	k14340
11-May-26	sobo cherry plum	k11940
11-May-26	fanta orange	k14340
11-May-26	nyika water	k88700
12-May-26	eggs	k30000
12-May-26	carrot	k7103
12-May-26	chambiko	k8240
12-May-26	carrier bag	k498
16-May-26	chambiko	k8240
16-May-26	carrier bag	k498
14-Dec-25	standard bread	k2575
14-Dec-25	Tangy mayonnaise 	k11495
14-Dec-25	Lk plastic cutlery forks	k11985
12-Dec-25	first choice milk 	k33920
15-Dec-25	nyika water	k28800
14-Nov-25	eggs	k27190
14-Nov-25	nano spaghetti	k1895
30-Jan-26	goods	k26778
23-Jan-26	goods	k61599
25-May-26	nyika water	k8700
13-May-26	water bottle 	k2500
23-Mar-26	white plates	k78000
23-Mar-26	hand fan	k15000
21-Mar-26	first choice milk 	k33920
20-Mar-26	dishwashing liquid lemon	k13160
20-Mar-26	simba mexican chilli	k1680
20-Mar-26	great valu mega	k16080
18-Mar-26	eggs	k12495
16-Jul-25	cake flour 	k80000
31-Oct-25	kukoma cooking oil	k14295
31-Oct-25	prestige margarine 	k13485
14-Jan-26	eggs	k14500
14-Jan-26	kings choice spaghetti	k4590
14-Jan-26	nyika water	k1895
13-Jan-26	bky raisin bread loaf	k5995
13-Jan-26	aromat cannister	k3945
13-Jan-26	L\dairy yog banana	k1225
8-Jan-26	Goods	k6384
17-Jan-26	goods	k9375
12-Jan-26	eggs	k14500
6-Jan-26	white bread	k3000
30-Dec-25	goods	k8673
20-Dec-25	lettuce local 	k1890
8-Nov-25	goods	k19980
18-Nov-25	kukoma cooking oil	k14295
18-Nov-25	eggs	k27190`;

function parseCost(s) {
  s = s.trim();
  if (!s) return 0;
  s = s.replace(/^[Kk]\s*/, '');
  if (s.startsWith('M') || s.startsWith('m')) {
    s = s.replace(/^[Mm]\s*/, '');
    return Math.round(parseFloat(s.replace(/,/g, '')) * 1000000) || 0;
  }
  s = s.replace(/[\s,]/g, '');
  return parseFloat(s) || 0;
}

function parseDate(s) {
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = s.trim().split('-');
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  let year = parseInt(parts[2]);
  if (year < 100) year += 2000;
  return new Date(year, month, day);
}

function categorize(desc) {
  const d = desc.toLowerCase();
  if (/chicken|ckn|wings|drumstick|leg portion|fillet|beef|steak|t-bone|mince|liver|sausage|bacon|meat|kapenta|biltong|topside|ramp/.test(d)) return 'Meat & Protein';
  if (/egg|eggs/.test(d)) return 'Eggs & Dairy';
  if (/milk|butter|margarine|cheese|cream|yoghurt|yog|dairy|chambiko|clover/.test(d)) return 'Dairy & Bakery';
  if (/flour|sugar|baking|yeast|essence|spice|salt|curry|pepper|garlic|ginger|herb|masala|aromat|cinnamon|robertson|rajah|maggi/.test(d)) return 'Spices & Baking';
  if (/coke|fanta|sprite|water|juice|pepsi|sobo|ceres|tea|coffee|sobe|soda|coca|cherry plum|passion|pineapple|orange squash|nyika/.test(d)) return 'Drinks & Beverages';
  if (/cabbage|lettuce|tomato|onion|carrot|pepper|cucumber|veg|beans|peas|potato|green|mushroom|lemon|garlic local|rape|nkhwani|masamba|fruit|melon/.test(d)) return 'Fresh Produce';
  if (/carrier bag|plastic|till bag|wrap|clingfilm|lunch box|container|aluminum|foil|disposable|plate|cup|straw|bamboo|baking mat|baking pap/.test(d)) return 'Packaging & Disposables';
  if (/cake|flora|cadbury|chocolate|oreo|twix|cookie|biscuit|candy|sweet|sweets|kit kat|snack|nuts|peanut|crisps|lays|nak|jifa/.test(d)) return 'Sweets & Snacks';
  if (/burger|bun|bread|pasta|spaghetti|macaroni|noodle|rice|pasta joy|granole|linguine/.test(d)) return 'Bread & Pasta';
  if (/doom|clean|dish|pine gel|omo|sunlight|detergent|soap|wash|hygienix|methylated|antiseptic|windolene|toilet|bleach|boom/.test(d)) return 'Cleaning & Hygiene';
  if (/office|paper|pen|pencil|staple|pad|clip|stamp|book|card|tissue|serviette|napkin|rotatrim|desk|post it/.test(d)) return 'Office Supplies';
  if (/flower|wall|decor|curtain|clock|pillow|bed|mattress|sheet|plastic spoon|plastic fork|cutlery|table|chair|shelf|basket|gift/.test(d)) return 'Decor & Furniture';
  if (/uniform|wear|tops|shoes|mug|glass|tray|knife|tool|hammer|lighter|iron|heater|mop|broom|bucket|brush|painting|tap|wire|wire/.test(d)) return 'Kitchenware & Equipment';
  if (/courier|transport|delivery/.test(d)) return 'Transport & Services';
  if (/mixed|goods|items|misc/.test(d)) return 'Mixed Items';
  if (/gas|lpg|water bottle/.test(d)) return 'Utilities & Gas';
  if (/jumbo|big|small/.test(d)) return 'Miscellaneous';
  return 'Other';
}

async function main() {
  const lines = raw.trim().split('\n');
  
  const byDate = new Map();
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 2) continue;
    const dateStr = parts[0].trim();
    const item = (parts[1] || '').trim();
    const costStr = parts[2] || '';
    const cost = parseCost(costStr);
    if (cost <= 0) continue;
    const date = parseDate(dateStr);
    const dateKey = date.toISOString().slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey).push({ item: item || 'Miscellaneous', cost, desc: item || 'Miscellaneous' });
  }

  console.log(`Parsed ${lines.length} lines, ${byDate.size} unique dates`);

  // Check which dates already exist
  const existing = await prisma.$queryRawUnsafe(
    `SELECT DISTINCT to_char(created_at, 'YYYY-MM-DD') as d FROM expenses WHERE business_id = $1::uuid`,
    CAFE_ID
  );
  const existingDates = new Set(existing.map((r) => r.d));
  console.log(`Already imported: ${existingDates.size} dates`);

  let count = 0;
  let totalAmount = 0;

  for (const [dateStr, items] of [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (existingDates.has(dateStr)) continue;

    const total = items.reduce((s, i) => s + i.cost, 0);
    totalAmount += total;
    const cat = categorize(items[0].item);
    const createdAt = new Date(dateStr + 'T12:00:00Z');
    const note = `Imported: ${items.length} item(s)`;

    const rows = await prisma.$queryRawUnsafe(`
      INSERT INTO expenses (id, business_id, category, amount, note, created_by, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5::uuid, $6::timestamptz)
      RETURNING id
    `, CAFE_ID, cat, total, note, ADMIN_ID, createdAt);

    const expId = rows[0].id;

    for (const item of items) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO expense_items (id, expense_id, description, qty, unit, unit_price, total)
        VALUES (gen_random_uuid(), $1::uuid, $2, 1, null, $3, $4)
      `, expId, item.desc, item.cost, item.cost);
    }

    count++;
    if (count % 10 === 0) console.log(`  ${count} new dates imported...`);
  }

  console.log(`Imported ${count} new expenses, total: MK ${totalAmount.toLocaleString()}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
