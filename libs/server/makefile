IMAGE_NAME = mogoapi
TAG = latest
REGISTRY = sappsdev

build:
	@docker build --platform linux/amd64 -t $(REGISTRY)/$(IMAGE_NAME):$(TAG) .

push: build
	@docker push $(REGISTRY)/$(IMAGE_NAME):$(TAG)

all: build push