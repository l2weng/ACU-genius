create table tags_dg_tmp
(
	tag_id INTEGER
		primary key,
	name TEXT collate NOCASE not null
		unique,
	color TEXT,
	syncSkuId INTEGER,
	shapeType text,
	created NUMERIC default CURRENT_TIMESTAMP not null,
	modified NUMERIC default CURRENT_TIMESTAMP not null,
	check (name != '')
);

insert into tags_dg_tmp(tag_id, name, color, syncSkuId, shapeType, created, modified) select tag_id, name, color, syncSkuId, shapeType, created, modified from tags;

drop table tags;

alter table tags_dg_tmp rename to tags;

